import { relations } from "drizzle-orm/relations";
import { users, budget_entries, family_members, shopping_items, recipes, shopping_list_templates, tasks, meal_plans, appointments, budget_limits, notifications, push_subscriptions, schedule_entries, family_join_requests, integrations, family_invites, reward_transactions, reward_settings, reward_goals, family_notes, ai_settings, recurring_expenses, recurring_expense_logs, kakeibo_months, password_resets, family_posts, schedule_entry_members, schedule_entry_exceptions, family_post_seen, appointment_recurrence_exceptions } from "./schema";

export const budget_entriesRelations = relations(budget_entries, ({one}) => ({
	user: one(users, {
		fields: [budget_entries.user_id],
		references: [users.id]
	}),
	family_member: one(family_members, {
		fields: [budget_entries.assigned_to],
		references: [family_members.id]
	}),
}));

export const usersRelations = relations(users, ({one, many}) => ({
	budget_entries: many(budget_entries),
	shopping_items: many(shopping_items),
	recipes: many(recipes),
	shopping_list_templates: many(shopping_list_templates),
	tasks: many(tasks),
	user: one(users, {
		fields: [users.family_owner_id],
		references: [users.id],
		relationName: "users_family_owner_id_users_id"
	}),
	users: many(users, {
		relationName: "users_family_owner_id_users_id"
	}),
	meal_plans: many(meal_plans),
	family_members_user_id: many(family_members, {
		relationName: "family_members_user_id_users_id"
	}),
	family_members_linked_user_id: many(family_members, {
		relationName: "family_members_linked_user_id_users_id"
	}),
	appointments: many(appointments),
	budget_limits: many(budget_limits),
	notifications: many(notifications),
	push_subscriptions: many(push_subscriptions),
	schedule_entries: many(schedule_entries),
	family_join_requests_owner_id: many(family_join_requests, {
		relationName: "family_join_requests_owner_id_users_id"
	}),
	family_join_requests_requester_id: many(family_join_requests, {
		relationName: "family_join_requests_requester_id_users_id"
	}),
	integrations: many(integrations),
	family_invites: many(family_invites),
	reward_transactions: many(reward_transactions),
	reward_settings: many(reward_settings),
	reward_goals: many(reward_goals),
	family_notes: many(family_notes),
	ai_settings: many(ai_settings),
	recurring_expenses: many(recurring_expenses),
	recurring_expense_logs: many(recurring_expense_logs),
	kakeibo_months: many(kakeibo_months),
	password_resets: many(password_resets),
	family_posts_user_id: many(family_posts, {
		relationName: "family_posts_user_id_users_id"
	}),
	family_posts_author_user_id: many(family_posts, {
		relationName: "family_posts_author_user_id_users_id"
	}),
	family_post_seens: many(family_post_seen),
}));

export const family_membersRelations = relations(family_members, ({one, many}) => ({
	budget_entries: many(budget_entries),
	user_user_id: one(users, {
		fields: [family_members.user_id],
		references: [users.id],
		relationName: "family_members_user_id_users_id"
	}),
	user_linked_user_id: one(users, {
		fields: [family_members.linked_user_id],
		references: [users.id],
		relationName: "family_members_linked_user_id_users_id"
	}),
	schedule_entries: many(schedule_entries),
	reward_transactions: many(reward_transactions),
	reward_goals: many(reward_goals),
	schedule_entry_members: many(schedule_entry_members),
}));

export const shopping_itemsRelations = relations(shopping_items, ({one}) => ({
	user: one(users, {
		fields: [shopping_items.user_id],
		references: [users.id]
	}),
}));

export const recipesRelations = relations(recipes, ({one, many}) => ({
	user: one(users, {
		fields: [recipes.user_id],
		references: [users.id]
	}),
	meal_plans: many(meal_plans),
}));

export const shopping_list_templatesRelations = relations(shopping_list_templates, ({one}) => ({
	user: one(users, {
		fields: [shopping_list_templates.user_id],
		references: [users.id]
	}),
}));

export const tasksRelations = relations(tasks, ({one, many}) => ({
	user: one(users, {
		fields: [tasks.user_id],
		references: [users.id]
	}),
	reward_transactions: many(reward_transactions),
}));

export const meal_plansRelations = relations(meal_plans, ({one}) => ({
	user: one(users, {
		fields: [meal_plans.user_id],
		references: [users.id]
	}),
	recipe: one(recipes, {
		fields: [meal_plans.recipe_id],
		references: [recipes.id]
	}),
}));

export const appointmentsRelations = relations(appointments, ({one, many}) => ({
	user: one(users, {
		fields: [appointments.user_id],
		references: [users.id]
	}),
	appointment_recurrence_exceptions: many(appointment_recurrence_exceptions),
}));

export const budget_limitsRelations = relations(budget_limits, ({one}) => ({
	user: one(users, {
		fields: [budget_limits.user_id],
		references: [users.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	user: one(users, {
		fields: [notifications.user_id],
		references: [users.id]
	}),
}));

export const push_subscriptionsRelations = relations(push_subscriptions, ({one}) => ({
	user: one(users, {
		fields: [push_subscriptions.user_id],
		references: [users.id]
	}),
}));

export const schedule_entriesRelations = relations(schedule_entries, ({one, many}) => ({
	user: one(users, {
		fields: [schedule_entries.user_id],
		references: [users.id]
	}),
	family_member: one(family_members, {
		fields: [schedule_entries.family_member_id],
		references: [family_members.id]
	}),
	schedule_entry_members: many(schedule_entry_members),
	schedule_entry_exceptions: many(schedule_entry_exceptions),
}));

export const family_join_requestsRelations = relations(family_join_requests, ({one}) => ({
	user_owner_id: one(users, {
		fields: [family_join_requests.owner_id],
		references: [users.id],
		relationName: "family_join_requests_owner_id_users_id"
	}),
	user_requester_id: one(users, {
		fields: [family_join_requests.requester_id],
		references: [users.id],
		relationName: "family_join_requests_requester_id_users_id"
	}),
}));

export const integrationsRelations = relations(integrations, ({one}) => ({
	user: one(users, {
		fields: [integrations.family_id],
		references: [users.id]
	}),
}));

export const family_invitesRelations = relations(family_invites, ({one}) => ({
	user: one(users, {
		fields: [family_invites.owner_id],
		references: [users.id]
	}),
}));

export const reward_transactionsRelations = relations(reward_transactions, ({one}) => ({
	user: one(users, {
		fields: [reward_transactions.user_id],
		references: [users.id]
	}),
	family_member: one(family_members, {
		fields: [reward_transactions.member_id],
		references: [family_members.id]
	}),
	task: one(tasks, {
		fields: [reward_transactions.task_id],
		references: [tasks.id]
	}),
}));

export const reward_settingsRelations = relations(reward_settings, ({one}) => ({
	user: one(users, {
		fields: [reward_settings.user_id],
		references: [users.id]
	}),
}));

export const reward_goalsRelations = relations(reward_goals, ({one}) => ({
	user: one(users, {
		fields: [reward_goals.user_id],
		references: [users.id]
	}),
	family_member: one(family_members, {
		fields: [reward_goals.member_id],
		references: [family_members.id]
	}),
}));

export const family_notesRelations = relations(family_notes, ({one}) => ({
	user: one(users, {
		fields: [family_notes.user_id],
		references: [users.id]
	}),
}));

export const ai_settingsRelations = relations(ai_settings, ({one}) => ({
	user: one(users, {
		fields: [ai_settings.user_id],
		references: [users.id]
	}),
}));

export const recurring_expensesRelations = relations(recurring_expenses, ({one, many}) => ({
	user: one(users, {
		fields: [recurring_expenses.user_id],
		references: [users.id]
	}),
	recurring_expense_logs: many(recurring_expense_logs),
}));

export const recurring_expense_logsRelations = relations(recurring_expense_logs, ({one}) => ({
	recurring_expense: one(recurring_expenses, {
		fields: [recurring_expense_logs.recurring_expense_id],
		references: [recurring_expenses.id]
	}),
	user: one(users, {
		fields: [recurring_expense_logs.user_id],
		references: [users.id]
	}),
}));

export const kakeibo_monthsRelations = relations(kakeibo_months, ({one}) => ({
	user: one(users, {
		fields: [kakeibo_months.user_id],
		references: [users.id]
	}),
}));

export const password_resetsRelations = relations(password_resets, ({one}) => ({
	user: one(users, {
		fields: [password_resets.user_id],
		references: [users.id]
	}),
}));

export const family_postsRelations = relations(family_posts, ({one, many}) => ({
	user_user_id: one(users, {
		fields: [family_posts.user_id],
		references: [users.id],
		relationName: "family_posts_user_id_users_id"
	}),
	user_author_user_id: one(users, {
		fields: [family_posts.author_user_id],
		references: [users.id],
		relationName: "family_posts_author_user_id_users_id"
	}),
	family_post_seens: many(family_post_seen),
}));

export const schedule_entry_membersRelations = relations(schedule_entry_members, ({one}) => ({
	family_member: one(family_members, {
		fields: [schedule_entry_members.family_member_id],
		references: [family_members.id]
	}),
	schedule_entry: one(schedule_entries, {
		fields: [schedule_entry_members.entry_id],
		references: [schedule_entries.id]
	}),
}));

export const schedule_entry_exceptionsRelations = relations(schedule_entry_exceptions, ({one}) => ({
	schedule_entry: one(schedule_entries, {
		fields: [schedule_entry_exceptions.entry_id],
		references: [schedule_entries.id]
	}),
}));

export const family_post_seenRelations = relations(family_post_seen, ({one}) => ({
	family_post: one(family_posts, {
		fields: [family_post_seen.post_id],
		references: [family_posts.id]
	}),
	user: one(users, {
		fields: [family_post_seen.user_id],
		references: [users.id]
	}),
}));

export const appointment_recurrence_exceptionsRelations = relations(appointment_recurrence_exceptions, ({one}) => ({
	appointment: one(appointments, {
		fields: [appointment_recurrence_exceptions.appointment_id],
		references: [appointments.id]
	}),
}));