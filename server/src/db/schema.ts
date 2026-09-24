import { pgTable, index, foreignKey, uuid, varchar, numeric, text, date, boolean, timestamp, jsonb, integer, uniqueIndex, unique, check, time, serial, bigint, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const budget_entries = pgTable("budget_entries", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	user_id: uuid().notNull(),
	category: varchar({ length: 50 }).notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	description: text(),
	date: date().notNull(),
	is_expense: boolean().default(true),
	created_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updated_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	assigned_to: uuid(),
}, (table) => [
	index("idx_budget_entries_assigned_to").using("btree", table.assigned_to.asc().nullsLast().op("uuid_ops")),
	index("idx_budget_entries_category").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("idx_budget_entries_date").using("btree", table.date.asc().nullsLast().op("date_ops")),
	index("idx_budget_entries_user_id").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "budget_entries_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.assigned_to],
			foreignColumns: [family_members.id],
			name: "budget_entries_assigned_to_fkey"
		}).onDelete("set null"),
]);

export const shopping_items = pgTable("shopping_items", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	user_id: uuid().notNull(),
	name: varchar({ length: 255 }).notNull(),
	category: varchar({ length: 50 }).notNull(),
	quantity: numeric({ precision: 10, scale:  2 }),
	unit: varchar({ length: 50 }),
	price: numeric({ precision: 10, scale:  2 }),
	is_checked: boolean().default(false),
	notes: text(),
	created_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updated_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_shopping_items_category").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("idx_shopping_items_user_id").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "shopping_items_user_id_fkey"
		}).onDelete("cascade"),
]);

export const recipes = pgTable("recipes", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	user_id: uuid().notNull(),
	name: varchar({ length: 255 }).notNull(),
	category: varchar({ length: 50 }).notNull(),
	description: text(),
	ingredients: jsonb().notNull(),
	instructions: jsonb().notNull(),
	prep_time: integer(),
	cook_time: integer(),
	servings: integer(),
	difficulty: varchar({ length: 50 }),
	tags: jsonb(),
	image_url: text(),
	created_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updated_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_recipes_category").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("idx_recipes_user_id").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "recipes_user_id_fkey"
		}).onDelete("cascade"),
]);

export const shopping_list_templates = pgTable("shopping_list_templates", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	user_id: uuid().notNull(),
	name: varchar({ length: 255 }).notNull(),
	items: jsonb().notNull(),
	created_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updated_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "shopping_list_templates_user_id_fkey"
		}).onDelete("cascade"),
]);

export const tasks = pgTable("tasks", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	user_id: uuid().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	is_completed: boolean().default(false),
	due_date: timestamp({ mode: 'string' }),
	frequency: varchar({ length: 50 }),
	priority: varchar({ length: 50 }),
	assigned_to: jsonb().default([]),
	completed_at: timestamp({ mode: 'string' }),
	created_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updated_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	points: integer().default(0).notNull(),
	pending_approval: boolean().default(false).notNull(),
}, (table) => [
	index("idx_tasks_assigned_to").using("gin", table.assigned_to.asc().nullsLast().op("jsonb_ops")),
	index("idx_tasks_due_date").using("btree", table.due_date.asc().nullsLast().op("timestamp_ops")),
	index("idx_tasks_user_id").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "tasks_user_id_fkey"
		}).onDelete("cascade"),
]);

export const users = pgTable("users", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	password_hash: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	created_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updated_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	family_owner_id: uuid(),
	role: varchar({ length: 20 }).default('parent'),
	currency: varchar({ length: 3 }).default('EUR'),
	calendar_token: varchar({ length: 64 }),
	avatar_url: text(),
	language: varchar({ length: 8 }).default('fr').notNull(),
	disabled_modules: text().default('[]').notNull(),
	custom_categories: text(),
	kakeibo_pillars: text(),
	dashboard_prefs: text(),
}, (table) => [
	uniqueIndex("idx_users_calendar_token").using("btree", table.calendar_token.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.family_owner_id],
			foreignColumns: [table.id],
			name: "users_family_owner_id_fkey"
		}).onDelete("set null"),
	unique("users_email_key").on(table.email),
]);

export const meal_plans = pgTable("meal_plans", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	user_id: uuid().notNull(),
	date: date().notNull(),
	meal_type: varchar({ length: 50 }).notNull(),
	recipe_id: uuid(),
	custom_meal: text(),
	notes: text(),
	created_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updated_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_meal_plans_date").using("btree", table.date.asc().nullsLast().op("date_ops")),
	index("idx_meal_plans_user_id").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "meal_plans_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.recipe_id],
			foreignColumns: [recipes.id],
			name: "meal_plans_recipe_id_fkey"
		}).onDelete("set null"),
	unique("meal_plans_user_id_date_meal_type_key").on(table.user_id, table.date, table.meal_type),
]);

export const family_members = pgTable("family_members", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	user_id: uuid().notNull(),
	name: varchar({ length: 255 }).notNull(),
	birth_date: date(),
	color: varchar({ length: 7 }).default('#3B82F6').notNull(),
	blood_type: varchar({ length: 3 }),
	allergies: text(),
	vaccines: text(),
	emergency_contact: text(),
	medical_notes: text(),
	avatar_url: text(),
	created_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updated_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	role: varchar({ length: 50 }).default('Autre').notNull(),
	medications: text(),
	emergency_contact_name: text(),
	emergency_contact_phone: text(),
	notes: text(),
	linked_user_id: uuid(),
	monthly_income: numeric({ precision: 10, scale:  2 }).default('0').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "family_members_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.linked_user_id],
			foreignColumns: [users.id],
			name: "family_members_linked_user_id_fkey"
		}).onDelete("set null"),
]);

export const appointments = pgTable("appointments", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	user_id: uuid().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	start_time: timestamp({ mode: 'string' }).notNull(),
	end_time: timestamp({ mode: 'string' }),
	location: text(),
	family_member_ids: jsonb().default([]),
	reminder_30min: boolean().default(false),
	reminder_1hour: boolean().default(false),
	notes: text(),
	created_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updated_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	caldav_uid: text(),
	recurrence_frequency: varchar({ length: 16 }).default('none').notNull(),
	recurrence_interval: integer().default(1).notNull(),
	recurrence_until: date(),
	color: varchar({ length: 7 }).default('#DC4A60').notNull(),
	is_all_day: boolean().default(false).notNull(),
}, (table) => [
	uniqueIndex("idx_appointments_caldav_uid").using("btree", table.user_id.asc().nullsLast().op("text_ops"), table.caldav_uid.asc().nullsLast().op("text_ops")).where(sql`(caldav_uid IS NOT NULL)`),
	index("idx_appointments_start_time").using("btree", table.start_time.asc().nullsLast().op("timestamp_ops")),
	index("idx_appointments_user_id").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "appointments_user_id_fkey"
		}).onDelete("cascade"),
]);

export const budget_limits = pgTable("budget_limits", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	user_id: uuid().notNull(),
	category: varchar({ length: 50 }).notNull(),
	monthly_limit: numeric({ precision: 10, scale:  2 }).notNull(),
	month: integer().notNull(),
	year: integer().notNull(),
	created_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updated_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "budget_limits_user_id_fkey"
		}).onDelete("cascade"),
	unique("budget_limits_user_id_category_month_year_key").on(table.user_id, table.category, table.month, table.year),
	check("budget_limits_month_check", sql`(month >= 1) AND (month <= 12)`),
]);

export const notifications = pgTable("notifications", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	user_id: uuid().notNull(),
	title: varchar({ length: 255 }).notNull(),
	message: text().notNull(),
	type: varchar({ length: 50 }).notNull(),
	is_read: boolean().default(false),
	related_id: uuid(),
	created_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updated_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_notifications_is_read").using("btree", table.is_read.asc().nullsLast().op("bool_ops")),
	index("idx_notifications_user_id").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "notifications_user_id_fkey"
		}).onDelete("cascade"),
]);

export const push_subscriptions = pgTable("push_subscriptions", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	user_id: uuid().notNull(),
	endpoint: text().notNull(),
	keys: jsonb().notNull(),
	created_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "push_subscriptions_user_id_fkey"
		}).onDelete("cascade"),
	unique("push_subscriptions_user_id_endpoint_key").on(table.user_id, table.endpoint),
]);

export const schedule_entries = pgTable("schedule_entries", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	user_id: uuid().notNull(),
	family_member_id: uuid().notNull(),
	schedule_type: varchar({ length: 30 }).default('work').notNull(),
	title: varchar({ length: 255 }).notNull(),
	day_of_week: integer().notNull(),
	start_time: time().notNull(),
	end_time: time().notNull(),
	specific_date: date(),
	location: text(),
	notes: text(),
	created_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updated_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_schedule_entries_member").using("btree", table.family_member_id.asc().nullsLast().op("uuid_ops")),
	index("idx_schedule_entries_user_day").using("btree", table.user_id.asc().nullsLast().op("int4_ops"), table.day_of_week.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "schedule_entries_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.family_member_id],
			foreignColumns: [family_members.id],
			name: "schedule_entries_family_member_id_fkey"
		}).onDelete("cascade"),
	check("schedule_entries_day_of_week_check", sql`(day_of_week >= 1) AND (day_of_week <= 7)`),
]);

export const family_join_requests = pgTable("family_join_requests", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	owner_id: uuid().notNull(),
	requester_id: uuid().notNull(),
	status: varchar({ length: 20 }).default('pending'),
	created_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	responded_at: timestamp({ mode: 'string' }),
}, (table) => [
	index("idx_family_join_requests_owner").using("btree", table.owner_id.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("idx_family_join_requests_pending").using("btree", table.requester_id.asc().nullsLast().op("uuid_ops")).where(sql`((status)::text = 'pending'::text)`),
	index("idx_family_join_requests_requester").using("btree", table.requester_id.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.owner_id],
			foreignColumns: [users.id],
			name: "family_join_requests_owner_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.requester_id],
			foreignColumns: [users.id],
			name: "family_join_requests_requester_id_fkey"
		}).onDelete("cascade"),
	check("family_join_requests_status_check", sql`(status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'cancelled'::character varying])::text[])`),
]);

export const integrations = pgTable("integrations", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	family_id: uuid().notNull(),
	type: varchar({ length: 50 }).notNull(),
	display_name: varchar({ length: 100 }),
	base_url: text().notNull(),
	encrypted_credentials: text(),
	config: jsonb().default({}),
	status: varchar({ length: 20 }).default('connected'),
	last_synced_at: timestamp({ withTimezone: true, mode: 'string' }),
	last_error: text(),
	created_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updated_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_integrations_family_id").using("btree", table.family_id.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.family_id],
			foreignColumns: [users.id],
			name: "integrations_family_id_fkey"
		}).onDelete("cascade"),
	unique("integrations_family_id_type_key").on(table.family_id, table.type),
]);

export const family_invites = pgTable("family_invites", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	owner_id: uuid().notNull(),
	token: varchar({ length: 64 }).notNull(),
	invitee_email: text(),
	status: varchar({ length: 20 }).default('pending'),
	expires_at: timestamp({ mode: 'string' }).notNull(),
	created_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	role: varchar({ length: 20 }).default('parent').notNull(),
}, (table) => [
	index("idx_family_invites_owner").using("btree", table.owner_id.asc().nullsLast().op("uuid_ops")),
	index("idx_family_invites_token").using("btree", table.token.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.owner_id],
			foreignColumns: [users.id],
			name: "family_invites_owner_id_fkey"
		}).onDelete("cascade"),
	unique("family_invites_token_key").on(table.token),
	check("family_invites_status_check", sql`(status)::text = ANY ((ARRAY['pending'::character varying, 'accepted'::character varying, 'revoked'::character varying])::text[])`),
]);

export const reward_transactions = pgTable("reward_transactions", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	user_id: uuid().notNull(),
	member_id: uuid().notNull(),
	task_id: uuid(),
	points: integer().notNull(),
	type: varchar({ length: 20 }).notNull(),
	note: text(),
	created_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_reward_transactions_member").using("btree", table.member_id.asc().nullsLast().op("uuid_ops")),
	index("idx_reward_transactions_task").using("btree", table.task_id.asc().nullsLast().op("uuid_ops")),
	index("idx_reward_transactions_user").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "reward_transactions_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.member_id],
			foreignColumns: [family_members.id],
			name: "reward_transactions_member_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.task_id],
			foreignColumns: [tasks.id],
			name: "reward_transactions_task_id_fkey"
		}).onDelete("set null"),
	check("reward_transactions_type_check", sql`(type)::text = ANY ((ARRAY['earn'::character varying, 'adjust'::character varying, 'redeem'::character varying])::text[])`),
]);

export const reward_settings = pgTable("reward_settings", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	user_id: uuid().notNull(),
	points_value: numeric({ precision: 10, scale:  4 }).default('0.10').notNull(),
	created_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updated_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "reward_settings_user_id_fkey"
		}).onDelete("cascade"),
	unique("reward_settings_user_id_key").on(table.user_id),
]);

export const reward_goals = pgTable("reward_goals", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	user_id: uuid().notNull(),
	member_id: uuid().notNull(),
	title: varchar({ length: 200 }).notNull(),
	emoji: varchar({ length: 16 }),
	target_amount: numeric({ precision: 10, scale:  2 }).notNull(),
	status: varchar({ length: 20 }).default('active').notNull(),
	created_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	achieved_at: timestamp({ mode: 'string' }),
}, (table) => [
	index("idx_reward_goals_user_member").using("btree", table.user_id.asc().nullsLast().op("uuid_ops"), table.member_id.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "reward_goals_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.member_id],
			foreignColumns: [family_members.id],
			name: "reward_goals_member_id_fkey"
		}).onDelete("cascade"),
	check("reward_goals_target_amount_check", sql`target_amount > (0)::numeric`),
	check("reward_goals_status_check", sql`(status)::text = ANY ((ARRAY['active'::character varying, 'achieved'::character varying, 'archived'::character varying])::text[])`),
]);

export const family_notes = pgTable("family_notes", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	user_id: uuid().notNull(),
	author_name: varchar({ length: 100 }).notNull(),
	content: varchar({ length: 500 }).notNull(),
	color: varchar({ length: 20 }).default('yellow').notNull(),
	expires_at: timestamp({ mode: 'string' }),
	created_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_family_notes_user").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "family_notes_user_id_fkey"
		}).onDelete("cascade"),
]);

export const ai_settings = pgTable("ai_settings", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	user_id: uuid().notNull(),
	provider: varchar({ length: 20 }).notNull(),
	base_url: text(),
	encrypted_api_key: text(),
	model: varchar({ length: 100 }).notNull(),
	enabled: boolean().default(true).notNull(),
	created_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updated_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "ai_settings_user_id_fkey"
		}).onDelete("cascade"),
	unique("ai_settings_user_id_key").on(table.user_id),
	check("ai_settings_provider_check", sql`(provider)::text = ANY ((ARRAY['ollama'::character varying, 'openai'::character varying, 'anthropic'::character varying, 'gemini'::character varying])::text[])`),
]);

export const recurring_expenses = pgTable("recurring_expenses", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	user_id: uuid().notNull(),
	label: varchar({ length: 255 }).notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	category: varchar({ length: 50 }).default('Maison').notNull(),
	debit_day: integer().default(1).notNull(),
	is_active: boolean().default(true),
	created_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updated_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_recurring_expenses_user_id").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "recurring_expenses_user_id_fkey"
		}).onDelete("cascade"),
	check("recurring_expenses_debit_day_check", sql`(debit_day >= 1) AND (debit_day <= 31)`),
]);

export const recurring_expense_logs = pgTable("recurring_expense_logs", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	recurring_expense_id: uuid().notNull(),
	user_id: uuid().notNull(),
	month: integer().notNull(),
	year: integer().notNull(),
	is_pointed: boolean().default(false),
	pointed_at: timestamp({ mode: 'string' }),
	created_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_recurring_expense_logs_month_year").using("btree", table.month.asc().nullsLast().op("int4_ops"), table.year.asc().nullsLast().op("int4_ops")),
	index("idx_recurring_expense_logs_user_id").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.recurring_expense_id],
			foreignColumns: [recurring_expenses.id],
			name: "recurring_expense_logs_recurring_expense_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "recurring_expense_logs_user_id_fkey"
		}).onDelete("cascade"),
	unique("recurring_expense_logs_recurring_expense_id_month_year_key").on(table.recurring_expense_id, table.month, table.year),
	check("recurring_expense_logs_month_check", sql`(month >= 1) AND (month <= 12)`),
]);

export const kakeibo_months = pgTable("kakeibo_months", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	user_id: uuid().notNull(),
	month: integer().notNull(),
	year: integer().notNull(),
	savings_goal: numeric({ precision: 10, scale:  2 }).default('0').notNull(),
	notes: text(),
	created_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updated_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_kakeibo_months_user_id").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "kakeibo_months_user_id_fkey"
		}).onDelete("cascade"),
	unique("kakeibo_months_user_id_month_year_key").on(table.user_id, table.month, table.year),
	check("kakeibo_months_month_check", sql`(month >= 1) AND (month <= 12)`),
]);

export const password_resets = pgTable("password_resets", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	user_id: uuid().notNull(),
	token_hash: varchar({ length: 64 }).notNull(),
	expires_at: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	used_at: timestamp({ withTimezone: true, mode: 'string' }),
	created_at: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	uniqueIndex("idx_password_resets_token_hash").using("btree", table.token_hash.asc().nullsLast().op("text_ops")),
	index("idx_password_resets_user").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "password_resets_user_id_fkey"
		}).onDelete("cascade"),
]);

export const family_posts = pgTable("family_posts", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	user_id: uuid().notNull(),
	author_user_id: uuid().notNull(),
	content: text(),
	image_url: text(),
	link_url: text(),
	created_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updated_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("idx_family_posts_author").using("btree", table.author_user_id.asc().nullsLast().op("uuid_ops")),
	index("idx_family_posts_user_created").using("btree", table.user_id.asc().nullsLast().op("timestamp_ops"), table.created_at.desc().nullsFirst().op("timestamp_ops")),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "family_posts_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.author_user_id],
			foreignColumns: [users.id],
			name: "family_posts_author_user_id_fkey"
		}).onDelete("cascade"),
]);

export const __drizzle_migrations = pgTable("__drizzle_migrations", {
	id: serial().primaryKey().notNull(),
	hash: text().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	created_at: bigint({ mode: "number" }),
});

export const schedule_entry_members = pgTable("schedule_entry_members", {
	entry_id: uuid().notNull(),
	family_member_id: uuid().notNull(),
}, (table) => [
	index("idx_schedule_entry_members_member").using("btree", table.family_member_id.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.family_member_id],
			foreignColumns: [family_members.id],
			name: "schedule_entry_members_family_member_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.entry_id],
			foreignColumns: [schedule_entries.id],
			name: "schedule_entry_members_entry_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.entry_id, table.family_member_id], name: "schedule_entry_members_pkey"}),
]);

export const schedule_entry_exceptions = pgTable("schedule_entry_exceptions", {
	entry_id: uuid().notNull(),
	excluded_date: date().notNull(),
	created_at: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.entry_id],
			foreignColumns: [schedule_entries.id],
			name: "schedule_entry_exceptions_entry_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.entry_id, table.excluded_date], name: "schedule_entry_exceptions_pkey"}),
]);

export const family_post_seen = pgTable("family_post_seen", {
	post_id: uuid().notNull(),
	user_id: uuid().notNull(),
	seen_at: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("idx_family_post_seen_user").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.post_id],
			foreignColumns: [family_posts.id],
			name: "family_post_seen_post_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: "family_post_seen_user_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.post_id, table.user_id], name: "family_post_seen_pkey"}),
]);

export const appointment_recurrence_exceptions = pgTable("appointment_recurrence_exceptions", {
	appointment_id: uuid().notNull(),
	occurrence_date: date().notNull(),
	exception_type: varchar({ length: 16 }).default('skip').notNull(),
	override_data: jsonb(),
	created_at: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_appointment_recurrence_exceptions_appointment").using("btree", table.appointment_id.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.appointment_id],
			foreignColumns: [appointments.id],
			name: "appointment_recurrence_exceptions_appointment_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.appointment_id, table.occurrence_date], name: "appointment_recurrence_exceptions_pkey"}),
]);
