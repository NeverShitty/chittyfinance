// System schema for ChittyFinance
// Uses Neon PostgreSQL with multi-tenant isolation

import { pgTable, uuid, text, timestamp, decimal, boolean } from 'drizzle-orm/pg-core';

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  email: text('email').notNull(),
  passwordHash: text('password_hash'),
  name: text('name'),
  role: text('role').notNull().default('user'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  description: text('description'),
  category: text('category'),
  date: timestamp('date').notNull(),
  metadata: text('metadata'), // JSON
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  type: text('type').notNull(), // checking, savings, credit
  balance: decimal('balance', { precision: 12, scale: 2 }).notNull().default('0'),
  externalId: text('external_id'), // For Mercury/Wave integration
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});