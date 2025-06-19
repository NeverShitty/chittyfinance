import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real, varchar, index, decimal, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enhanced Transactions with v2 features
export const transactionsV2 = pgTable("transactions_v2", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  
  // Basic transaction info
  title: text("title").notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  
  // Enhanced categorization
  category: text("category").notNull().default("Uncategorized"),
  subcategory: text("subcategory"),
  tags: jsonb("tags").$type<string[]>().default([]),
  
  // Transaction metadata
  type: text("type").notNull(), // 'income', 'expense', 'transfer'
  status: text("status").notNull().default("confirmed"), // 'pending', 'confirmed', 'cancelled'
  source: text("source"), // 'mercury', 'stripe', 'manual', etc.
  sourceTransactionId: text("source_transaction_id"),
  
  // Dates and timing
  date: timestamp("date").notNull(),
  processedDate: timestamp("processed_date"),
  
  // Location and merchant info
  merchant: text("merchant"),
  location: jsonb("location").$type<{ address?: string; city?: string; state?: string; country?: string }>(),
  
  // AI and automation
  aiCategory: text("ai_category"), // AI-suggested category
  aiConfidence: real("ai_confidence"), // Confidence score 0-1
  isRecurring: boolean("is_recurring").default(false),
  recurringGroupId: text("recurring_group_id"),
  
  // Audit fields
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
});

// Budget Management
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  
  // Budget amounts
  budgetAmount: decimal("budget_amount", { precision: 12, scale: 2 }).notNull(),
  spentAmount: decimal("spent_amount", { precision: 12, scale: 2 }).default("0"),
  remainingAmount: decimal("remaining_amount", { precision: 12, scale: 2 }).default("0"),
  
  // Budget period
  period: text("period").notNull(), // 'monthly', 'quarterly', 'yearly'
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  
  // Status and settings
  status: text("status").notNull().default("active"), // 'active', 'paused', 'completed'
  alertThreshold: integer("alert_threshold").default(80), // Percentage
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Financial Goals
export const financialGoals = pgTable("financial_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // 'savings', 'debt_reduction', 'revenue', 'expense_reduction'
  
  // Goal amounts
  targetAmount: decimal("target_amount", { precision: 12, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 12, scale: 2 }).default("0"),
  
  // Timeline
  startDate: timestamp("start_date").notNull(),
  targetDate: timestamp("target_date").notNull(),
  
  // Progress tracking
  status: text("status").notNull().default("active"), // 'active', 'completed', 'paused'
  progress: real("progress").default(0), // Percentage 0-100
  
  // Settings
  isPublic: boolean("is_public").default(false),
  notifications: boolean("notifications").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoice Management
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  
  // Invoice details
  invoiceNumber: text("invoice_number").notNull(),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email"),
  clientAddress: jsonb("client_address").$type<{ street?: string; city?: string; state?: string; zip?: string; country?: string }>(),
  
  // Financial details
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 12, scale: 2 }).default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  
  // Status and dates
  status: text("status").notNull().default("draft"), // 'draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled'
  issueDate: timestamp("issue_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  
  // Content
  items: jsonb("items").$type<Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>>().notNull(),
  notes: text("notes"),
  terms: text("terms"),
  
  // Integration
  sourceIntegrationId: integer("source_integration_id"),
  externalId: text("external_id"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique().on(table.userId, table.invoiceNumber),
]);

// Notifications System
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  
  type: text("type").notNull(), // 'budget_alert', 'goal_progress', 'invoice_due', 'payment_received', 'ai_insight'
  title: text("title").notNull(),
  message: text("message").notNull(),
  
  // Status
  read: boolean("read").default(false),
  priority: text("priority").notNull().default("normal"), // 'low', 'normal', 'high', 'urgent'
  
  // Metadata
  relatedEntity: text("related_entity"), // 'transaction', 'budget', 'invoice', etc.
  relatedEntityId: integer("related_entity_id"),
  data: jsonb("data").$type<Record<string, any>>().default({}),
  
  // Actions
  actionType: text("action_type"), // 'link', 'dismiss', 'approve', etc.
  actionUrl: text("action_url"),
  
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// Financial Reports
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  
  name: text("name").notNull(),
  type: text("type").notNull(), // 'profit_loss', 'cash_flow', 'expense_breakdown', 'custom'
  
  // Report configuration
  config: jsonb("config").$type<{
    dateRange: { start: string; end: string };
    categories?: string[];
    includeSubcategories?: boolean;
    groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year';
    compareWithPrevious?: boolean;
  }>().notNull(),
  
  // Generated data
  data: jsonb("data").$type<Record<string, any>>(),
  generatedAt: timestamp("generated_at"),
  
  // Sharing and automation
  isScheduled: boolean("is_scheduled").default(false),
  schedule: jsonb("schedule").$type<{ frequency: string; recipients: string[] }>(),
  isPublic: boolean("is_public").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Team Collaboration
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Team owner
  memberUserId: integer("member_user_id").notNull(),
  
  role: text("role").notNull().default("viewer"), // 'owner', 'admin', 'editor', 'viewer'
  permissions: jsonb("permissions").$type<string[]>().default([]),
  
  invitedAt: timestamp("invited_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
  status: text("status").notNull().default("pending"), // 'pending', 'active', 'suspended'
}, (table) => [
  unique().on(table.userId, table.memberUserId),
]);

// AI Insights and Recommendations
export const aiInsights = pgTable("ai_insights", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  
  type: text("type").notNull(), // 'spending_pattern', 'budget_recommendation', 'cost_saving', 'cash_flow_prediction'
  title: text("title").notNull(),
  description: text("description").notNull(),
  
  // Insight data
  data: jsonb("data").$type<Record<string, any>>().notNull(),
  confidence: real("confidence").notNull(), // 0-1
  impact: text("impact").notNull(), // 'low', 'medium', 'high'
  
  // Actions
  actionable: boolean("actionable").default(true),
  actions: jsonb("actions").$type<Array<{
    type: string;
    label: string;
    description: string;
    data?: any;
  }>>().default([]),
  
  // Status
  status: text("status").notNull().default("active"), // 'active', 'dismissed', 'implemented'
  userFeedback: text("user_feedback"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced insert schemas
export const insertTransactionV2Schema = createInsertSchema(transactionsV2);
export const insertBudgetSchema = createInsertSchema(budgets);
export const insertFinancialGoalSchema = createInsertSchema(financialGoals);
export const insertInvoiceSchema = createInsertSchema(invoices);
export const insertNotificationSchema = createInsertSchema(notifications);
export const insertReportSchema = createInsertSchema(reports);
export const insertTeamMemberSchema = createInsertSchema(teamMembers);
export const insertAiInsightSchema = createInsertSchema(aiInsights);

// Enhanced type definitions
export type TransactionV2 = typeof transactionsV2.$inferSelect;
export type InsertTransactionV2 = z.infer<typeof insertTransactionV2Schema>;

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;

export type FinancialGoal = typeof financialGoals.$inferSelect;
export type InsertFinancialGoal = z.infer<typeof insertFinancialGoalSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;

export type AiInsight = typeof aiInsights.$inferSelect;
export type InsertAiInsight = z.infer<typeof insertAiInsightSchema>;