import { 
  users, type User, type InsertUser,
  integrations, type Integration, type InsertIntegration,
  financialSummaries, type FinancialSummary, type InsertFinancialSummary,
  transactions, type Transaction, type InsertTransaction,
  tasks, type Task, type InsertTask,
  aiMessages, type AiMessage, type InsertAiMessage
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Integration operations
  getIntegrations(userId: number): Promise<Integration[]>;
  getIntegration(id: number): Promise<Integration | undefined>;
  createIntegration(integration: InsertIntegration): Promise<Integration>;
  updateIntegration(id: number, integration: Partial<Integration>): Promise<Integration | undefined>;
  
  // Financial summary operations
  getFinancialSummary(userId: number): Promise<FinancialSummary | undefined>;
  createFinancialSummary(summary: InsertFinancialSummary): Promise<FinancialSummary>;
  updateFinancialSummary(userId: number, summary: Partial<FinancialSummary>): Promise<FinancialSummary | undefined>;
  
  // Transaction operations
  getTransactions(userId: number, limit?: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Task operations
  getTasks(userId: number, limit?: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  
  // AI Message operations
  getAiMessages(userId: number, limit?: number): Promise<AiMessage[]>;
  createAiMessage(message: InsertAiMessage): Promise<AiMessage>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private integrations: Map<number, Integration>;
  private financialSummaries: Map<number, FinancialSummary>;
  private transactions: Map<number, Transaction>;
  private tasks: Map<number, Task>;
  private aiMessages: Map<number, AiMessage>;

  private currentUserId: number;
  private currentIntegrationId: number;
  private currentFinancialSummaryId: number;
  private currentTransactionId: number;
  private currentTaskId: number;
  private currentAiMessageId: number;

  constructor() {
    this.users = new Map();
    this.integrations = new Map();
    this.financialSummaries = new Map();
    this.transactions = new Map();
    this.tasks = new Map();
    this.aiMessages = new Map();

    this.currentUserId = 1;
    this.currentIntegrationId = 1;
    this.currentFinancialSummaryId = 1;
    this.currentTransactionId = 1;
    this.currentTaskId = 1;
    this.currentAiMessageId = 1;

    // Add default user
    this.createUser({
      username: "demo",
      password: "password", // In a real app, would be hashed
      displayName: "Sarah Johnson",
      email: "sarah@example.com",
      role: "Financial Manager",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Integration operations
  async getIntegrations(userId: number): Promise<Integration[]> {
    return Array.from(this.integrations.values()).filter(
      (integration) => integration.userId === userId,
    );
  }

  async getIntegration(id: number): Promise<Integration | undefined> {
    return this.integrations.get(id);
  }

  async createIntegration(insertIntegration: InsertIntegration): Promise<Integration> {
    const id = this.currentIntegrationId++;
    const integration: Integration = { ...insertIntegration, id };
    this.integrations.set(id, integration);
    return integration;
  }

  async updateIntegration(id: number, data: Partial<Integration>): Promise<Integration | undefined> {
    const integration = this.integrations.get(id);
    if (!integration) return undefined;

    const updatedIntegration = { ...integration, ...data };
    this.integrations.set(id, updatedIntegration);
    return updatedIntegration;
  }

  // Financial summary operations
  async getFinancialSummary(userId: number): Promise<FinancialSummary | undefined> {
    return Array.from(this.financialSummaries.values()).find(
      (summary) => summary.userId === userId,
    );
  }

  async createFinancialSummary(insertSummary: InsertFinancialSummary): Promise<FinancialSummary> {
    const id = this.currentFinancialSummaryId++;
    const now = new Date();
    const summary: FinancialSummary = { ...insertSummary, id, updatedAt: now };
    this.financialSummaries.set(id, summary);
    return summary;
  }

  async updateFinancialSummary(userId: number, data: Partial<FinancialSummary>): Promise<FinancialSummary | undefined> {
    const summary = Array.from(this.financialSummaries.values()).find(
      (summary) => summary.userId === userId,
    );
    if (!summary) return undefined;

    const updatedSummary = { ...summary, ...data, updatedAt: new Date() };
    this.financialSummaries.set(summary.id, updatedSummary);
    return updatedSummary;
  }

  // Transaction operations
  async getTransactions(userId: number, limit?: number): Promise<Transaction[]> {
    const userTransactions = Array.from(this.transactions.values())
      .filter((transaction) => transaction.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return limit ? userTransactions.slice(0, limit) : userTransactions;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transaction: Transaction = { ...insertTransaction, id };
    this.transactions.set(id, transaction);
    return transaction;
  }

  // Task operations
  async getTasks(userId: number, limit?: number): Promise<Task[]> {
    const userTasks = Array.from(this.tasks.values())
      .filter((task) => task.userId === userId)
      .sort((a, b) => {
        // Sort by completion status, then by priority, then by due date
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        
        const priorityOrder = { urgent: 0, due_soon: 1, upcoming: 2 };
        const aPriority = a.priority ? priorityOrder[a.priority as keyof typeof priorityOrder] : 3;
        const bPriority = b.priority ? priorityOrder[b.priority as keyof typeof priorityOrder] : 3;
        
        if (aPriority !== bPriority) return aPriority - bPriority;
        
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        return 0;
      });

    return limit ? userTasks.slice(0, limit) : userTasks;
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const task: Task = { ...insertTask, id };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, data: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    const updatedTask = { ...task, ...data };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  // AI Message operations
  async getAiMessages(userId: number, limit?: number): Promise<AiMessage[]> {
    const userMessages = Array.from(this.aiMessages.values())
      .filter((message) => message.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return limit ? userMessages.slice(0, limit) : userMessages;
  }

  async createAiMessage(insertMessage: InsertAiMessage): Promise<AiMessage> {
    const id = this.currentAiMessageId++;
    const now = new Date();
    const message: AiMessage = { ...insertMessage, id, timestamp: now };
    this.aiMessages.set(id, message);
    return message;
  }
}

export const storage = new MemStorage();

// Initialize default data
(async () => {
  const user = await storage.getUserByUsername("demo");
  if (!user) return;

  // Setup integrations for Chitty Services
  const integrations = [
    {
      userId: user.id,
      serviceType: "mercury_bank",
      name: "Mercury Bank",
      description: "Banking & Financial Data",
      connected: true,
      lastSynced: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      credentials: {}
    },
    {
      userId: user.id,
      serviceType: "wavapps",
      name: "WavApps",
      description: "Accounting & Invoicing",
      connected: true,
      lastSynced: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      credentials: {}
    },
    {
      userId: user.id,
      serviceType: "doorloop",
      name: "DoorLoop",
      description: "Property Management",
      connected: true,
      lastSynced: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      credentials: {}
    }
  ];

  for (const integration of integrations) {
    await storage.createIntegration(integration);
  }

  // Setup financial summary
  await storage.createFinancialSummary({
    userId: user.id,
    cashOnHand: 127842.50,
    monthlyRevenue: 43291.75,
    monthlyExpenses: 26142.30,
    outstandingInvoices: 18520.00,
  });

  // Setup transactions
  const transactions = [
    {
      userId: user.id,
      title: "Client Payment - Acme Corp",
      description: "Invoice #12345",
      amount: 7500.00,
      type: "income",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      userId: user.id,
      title: "Software Subscription",
      description: "Monthly SaaS Tools",
      amount: -1299.00,
      type: "expense",
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      userId: user.id,
      title: "Client Payment - XYZ Inc",
      description: "Invoice #12347",
      amount: 4200.00,
      type: "income",
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    }
  ];

  for (const transaction of transactions) {
    await storage.createTransaction(transaction);
  }

  // Setup tasks
  const tasks = [
    {
      userId: user.id,
      title: "Review Q2 expense report",
      description: "Due in 2 days",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      priority: "due_soon",
      completed: false,
    },
    {
      userId: user.id,
      title: "Approve pending invoice payments",
      description: "5 payments requiring approval",
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      priority: "urgent",
      completed: false,
    },
    {
      userId: user.id,
      title: "Schedule tax preparation meeting",
      description: "Due in 2 weeks",
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      priority: "upcoming",
      completed: false,
    },
  ];

  for (const task of tasks) {
    await storage.createTask(task);
  }

  // Setup initial AI message
  await storage.createAiMessage({
    userId: user.id,
    content: "Based on current cash flow projections, I recommend delaying the planned office expansion until Q3. Cash reserves are currently 12% below optimal levels for your business size. Would you like me to generate a detailed cost-reduction plan?",
    role: "assistant"
  });
})();
