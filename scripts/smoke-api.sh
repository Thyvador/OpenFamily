#!/usr/bin/env bash
set -euo pipefail

CURRENT_STAGE="initialization"

on_error() {
  local status="$1"
  local line="$2"
  echo "[ERROR] Stage '${CURRENT_STAGE}' failed at line ${line}: ${BASH_COMMAND} (exit ${status})" >&2
}

trap 'on_error "$?" "$LINENO"' ERR

API_BASE="${API_BASE:-http://localhost:3001}"
RUN_ID="${RUN_ID:-$(date +%s)-$RANDOM}"
EMAIL="${SMOKE_EMAIL:-smoke-${RUN_ID}@example.com}"
PASSWORD="${SMOKE_PASSWORD:-SmokeTest123!}"
NAME="${SMOKE_NAME:-Smoke ${RUN_ID}}"
TOKEN=""

request() {
  local method="$1"
  local path="$2"
  local body="${3:-}"

  local tmp
  tmp="$(mktemp)"

  if [[ -n "$body" ]]; then
    if ! code=$(curl -sS -o "$tmp" -w "%{http_code}" -X "$method" "$API_BASE$path" \
      -H "Content-Type: application/json" \
      ${TOKEN:+-H "Authorization: Bearer $TOKEN"} \
      -d "$body"); then
      echo "[ERROR] Stage '${CURRENT_STAGE}': request failed: $method $path" >&2
      echo "[ERROR] Reason: curl could not connect to $API_BASE" >&2
      rm -f "$tmp"
      return 1
    fi
  else
    if ! code=$(curl -sS -o "$tmp" -w "%{http_code}" -X "$method" "$API_BASE$path" \
      -H "Content-Type: application/json" \
      ${TOKEN:+-H "Authorization: Bearer $TOKEN"}); then
      echo "[ERROR] Stage '${CURRENT_STAGE}': request failed: $method $path" >&2
      echo "[ERROR] Reason: curl could not connect to $API_BASE" >&2
      rm -f "$tmp"
      return 1
    fi
  fi

  BODY="$(cat "$tmp")"
  rm -f "$tmp"

  if [[ "$code" -lt 200 || "$code" -ge 300 ]]; then
    echo "[ERROR] Stage '${CURRENT_STAGE}': $method $path -> HTTP $code" >&2
    echo "[ERROR] Response: ${BODY:-<empty response>}" >&2
    exit 1
  fi

  echo "$BODY"
}

assert_success() {
  if ! echo "$1" | jq -e '.success == true' >/dev/null 2>&1; then
    echo "[ERROR] Stage '${CURRENT_STAGE}': response did not contain success=true" >&2
    echo "[ERROR] Response: ${1:-<empty response>}" >&2
    return 1
  fi
}

CURRENT_STAGE="Health"
echo "[1/12] ${CURRENT_STAGE}"
health=$(request GET "/health")
if ! echo "$health" | jq -e '.status == "ok"' >/dev/null 2>&1; then
  echo "[ERROR] Stage '${CURRENT_STAGE}': expected status=ok" >&2
  echo "[ERROR] Response: ${health:-<empty response>}" >&2
  exit 1
fi
echo "[OK] ${CURRENT_STAGE}"

CURRENT_STAGE="Register"
echo "[2/12] ${CURRENT_STAGE}"
reg=$(request POST "/api/auth/register" "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"$NAME\"}")
assert_success "$reg"
TOKEN=$(echo "$reg" | jq -r '.data.token')

if [[ "$TOKEN" == "null" || -z "$TOKEN" ]]; then
  echo "[ERROR] Stage '${CURRENT_STAGE}': missing auth token" >&2
  echo "[ERROR] Response: $reg" >&2
  exit 1
fi
echo "[OK] ${CURRENT_STAGE}"

CURRENT_STAGE="Family"
echo "[3/12] ${CURRENT_STAGE}"
member=$(request POST "/api/family" '{"name":"Alice","role":"Parent","color":"#FF4466","birthdate":"1990-01-01","allergies":["Pollen"],"medications":["Vitamin C"],"emergency_contact_name":"Bob","emergency_contact_phone":"+33123456789","notes":"RAS"}')
assert_success "$member"
FAMILY_ID=$(echo "$member" | jq -r '.data.id')

request PUT "/api/family/$FAMILY_ID" '{"name":"Alice Martin","notes":"Note maj"}' >/dev/null
request GET "/api/family" >/dev/null
echo "[OK] ${CURRENT_STAGE}"

CURRENT_STAGE="Shopping"
echo "[4/12] ${CURRENT_STAGE}"
item=$(request POST "/api/shopping" '{"name":"Lait","category":"Alimentation","quantity":2,"price":1.5,"unit":"L"}')
assert_success "$item"
SHOP_ID=$(echo "$item" | jq -r '.data.id')
request PUT "/api/shopping/$SHOP_ID" '{"is_checked":true}' >/dev/null

tpl=$(request POST "/api/shopping/templates" '{"name":"Template Semaine","items":[{"name":"Pain","category":"Alimentation","quantity":1}]}')
assert_success "$tpl"
TPL_ID=$(echo "$tpl" | jq -r '.data.id')
request POST "/api/shopping/templates/$TPL_ID/apply" '{}' >/dev/null
request DELETE "/api/shopping/checked/clear" >/dev/null
request DELETE "/api/shopping/templates/$TPL_ID" >/dev/null
echo "[OK] ${CURRENT_STAGE}"

CURRENT_STAGE="Tasks"
echo "[5/12] ${CURRENT_STAGE}"
task=$(request POST "/api/tasks" "{\"title\":\"Sortir les poubelles\",\"priority\":\"Haute\",\"assigned_to\":\"$FAMILY_ID\"}")
assert_success "$task"
TASK_ID=$(echo "$task" | jq -r '.data.id')
request PUT "/api/tasks/$TASK_ID" '{"is_completed":true}' >/dev/null
request GET "/api/tasks/statistics" >/dev/null
echo "[OK] ${CURRENT_STAGE}"

CURRENT_STAGE="Appointments"
echo "[6/12] ${CURRENT_STAGE}"
apt=$(request POST "/api/appointments" "{\"title\":\"Dentiste\",\"start_time\":\"2026-03-10T09:00:00.000Z\",\"family_member_id\":\"$FAMILY_ID\",\"reminder_30min\":true}")
assert_success "$apt"
APPOINTMENT_ID=$(echo "$apt" | jq -r '.data.id')
request PUT "/api/appointments/$APPOINTMENT_ID" '{"location":"Cabinet Centre"}' >/dev/null
request GET "/api/appointments?start_date=2026-03-01T00:00:00.000Z&end_date=2026-03-31T23:59:59.000Z" >/dev/null
echo "[OK] ${CURRENT_STAGE}"

CURRENT_STAGE="Planning"
echo "[7/12] ${CURRENT_STAGE}"
planning=$(request POST "/api/planning" "{\"family_member_id\":\"$FAMILY_ID\",\"schedule_type\":\"work\",\"title\":\"Bureau\",\"day_of_week\":1,\"start_time\":\"09:00\",\"end_time\":\"17:00\"}")
assert_success "$planning"
PLANNING_ID=$(echo "$planning" | jq -r '.data.id')
request PUT "/api/planning/$PLANNING_ID" '{"location":"Open Space"}' >/dev/null
request GET "/api/planning?day_of_week=1" >/dev/null
planning_bulk=$(request POST "/api/planning/bulk" "{\"family_member_id\":\"$FAMILY_ID\",\"schedule_type\":\"work\",\"title\":\"Bureau\",\"day_of_week_list\":[2,3],\"start_time\":\"09:00\",\"end_time\":\"17:00\",\"replace_conflicts\":true}")
assert_success "$planning_bulk"
echo "[OK] ${CURRENT_STAGE}"

CURRENT_STAGE="Recipes"
echo "[8/12] ${CURRENT_STAGE}"
recipe=$(request POST "/api/recipes" '{"name":"Pasta","category":"Plat","ingredients":["Pates","Sel"],"instructions":["Cuire","Servir"],"difficulty":"Facile"}')
assert_success "$recipe"
RECIPE_ID=$(echo "$recipe" | jq -r '.data.id')
request PUT "/api/recipes/$RECIPE_ID" '{"description":"Recette test"}' >/dev/null
request GET "/api/recipes" >/dev/null
echo "[OK] ${CURRENT_STAGE}"

CURRENT_STAGE="Meal Plans"
echo "[9/12] ${CURRENT_STAGE}"
meal=$(request POST "/api/meal-plans" "{\"date\":\"2026-03-12\",\"meal_type\":\"Dejeuner\",\"recipe_id\":\"$RECIPE_ID\"}")
assert_success "$meal"
MEAL_ID=$(echo "$meal" | jq -r '.data.id')
request PUT "/api/meal-plans/$MEAL_ID" '{"notes":"Repas famille"}' >/dev/null
request GET "/api/meal-plans?start_date=2026-03-10&end_date=2026-03-20" >/dev/null
echo "[OK] ${CURRENT_STAGE}"

CURRENT_STAGE="Budget"
echo "[10/12] ${CURRENT_STAGE}"
budget=$(request POST "/api/budget/entries" '{"category":"Alimentation","amount":25.5,"date":"2026-03-11","is_expense":true}')
assert_success "$budget"
BUDGET_ID=$(echo "$budget" | jq -r '.data.id')
request PUT "/api/budget/entries/$BUDGET_ID" '{"description":"Courses semaine"}' >/dev/null
request POST "/api/budget/limits" '{"category":"Alimentation","monthly_limit":300,"month":3,"year":2026}' >/dev/null
request GET "/api/budget/statistics?month=3&year=2026" >/dev/null
echo "[OK] ${CURRENT_STAGE}"

CURRENT_STAGE="Dashboard"
echo "[11/12] ${CURRENT_STAGE}"
request GET "/api/dashboard" >/dev/null
echo "[OK] ${CURRENT_STAGE}"

CURRENT_STAGE="Cleanup"
echo "[12/12] ${CURRENT_STAGE}"
request DELETE "/api/meal-plans/$MEAL_ID" >/dev/null
request DELETE "/api/recipes/$RECIPE_ID" >/dev/null
request DELETE "/api/planning/$PLANNING_ID" >/dev/null
request DELETE "/api/appointments/$APPOINTMENT_ID" >/dev/null
request DELETE "/api/tasks/$TASK_ID" >/dev/null
request DELETE "/api/budget/entries/$BUDGET_ID" >/dev/null
request DELETE "/api/family/$FAMILY_ID" >/dev/null
echo "[OK] ${CURRENT_STAGE}"

echo "[OK] OpenFamily API smoke test complete"
