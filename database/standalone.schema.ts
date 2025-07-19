// Standalone schema for ChittyFinance
// Uses local SQLite database for development

import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  name: text('name'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  amount: real('amount').notNull(),
  description: text('description'),
  category: text('category'),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  type: text('type').notNull(), // checking, savings, credit
  balance: real('balance').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});