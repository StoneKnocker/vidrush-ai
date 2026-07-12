import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { ulid } from "ulid";

// Better auth tables
// Added indexes based on the table provided by Better auth
// https://www.better-auth.com/docs/concepts/database
export const user = sqliteTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: integer("emailVerified", { mode: "boolean" }).notNull(),
    image: text("image"),
    role: text("role", { enum: ["user", "admin"] })
      .notNull()
      .default("user"),
    banned: integer("banned", { mode: "boolean" }).notNull().default(false),
    banReason: text("banReason"),
    banExpires: integer("banExpires", { mode: "timestamp" }),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  },
  (table) => [index("user_email_idx").on(table.email)],
);

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: text("userId")
      .notNull()
      .references(() => user.id),
    impersonatedBy: text("impersonatedBy"),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    index("session_userId_idx").on(table.userId),
    index("session_token_idx").on(table.token),
  ],
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => user.id),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: integer("accessTokenExpiresAt", {
      mode: "timestamp",
    }),
    refreshTokenExpiresAt: integer("refreshTokenExpiresAt", {
      mode: "timestamp",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    index("account_userId_idx").on(table.userId),
    index("account_providerId_accountId_idx").on(
      table.providerId,
      table.accountId,
    ),
  ],
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" }),
    updatedAt: integer("updatedAt", { mode: "timestamp" }),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const rateLimit = sqliteTable(
  "rateLimit",
  {
    id: text("id").primaryKey(),
    key: text("key"),
    count: integer("count"),
    lastRequest: integer("lastRequest"),
  },
  (table) => [index("rateLimit_key_idx").on(table.key)],
);

// User balance table
export const userBalance = sqliteTable("user_balance", {
  userId: text("userId")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  subscriptionCredits: integer("subscriptionCredits").notNull().default(0),
  permanentCredits: integer("permanentCredits").notNull().default(0),
  subscriptionCycleEnd: integer("subscriptionCycleEnd", { mode: "timestamp" }),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

// Subscription table
export const subscription = sqliteTable(
  "subscription",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerSubscriptionId: text("providerSubscriptionId").notNull(),
    status: text("status").notNull(),
    planId: text("planId").notNull(),
    periodStart: integer("periodStart", { mode: "timestamp" }).notNull(),
    periodEnd: integer("periodEnd", { mode: "timestamp" }).notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updatedAt", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => [index("subscription_userId_idx").on(table.userId)],
);

// Payment table
export const payment = sqliteTable(
  "payment",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    publicId: text("publicId")
      .notNull()
      .unique()
      .$defaultFn(() => `pay_${ulid()}`),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    currency: text("currency").notNull().default("USD"),
    planId: text("planId").notNull(),
    provider: text("provider").notNull(),
    providerTransactionId: text("providerTransactionId"),
    providerSessionId: text("providerSessionId"),
    creditType: text("type").notNull(),
    creditsAmount: integer("creditsAmount").notNull(),
    status: text("status").notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updatedAt", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("payment_publicId_idx").on(table.publicId),
    index("payment_providerSessionId_idx").on(table.providerSessionId),
    index("payment_userId_idx").on(table.userId),
  ],
);

// Credit history table
export const creditHistory = sqliteTable(
  "credit_history",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    creditType: text("creditType").notNull(),
    creditEvent: text("creditEvent").notNull(),
    description: text("description").notNull().default(""),
    referenceId: text("referenceId").notNull().default(""),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [index("credit_history_userId_idx").on(table.userId)],
);

// User sources tracking table
export const userSource = sqliteTable(
  "user_source",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("userId").references(() => user.id, { onDelete: "cascade" }),
    firstVisitAt: integer("firstVisitAt", { mode: "timestamp" }).notNull(),
    utmSource: text("utmSource").notNull().default(""),
    utmMedium: text("utmMedium").notNull().default(""),
    utmCampaign: text("utmCampaign").notNull().default(""),
    utmContent: text("utmContent").notNull().default(""),
    utmTerm: text("utmTerm").notNull().default(""),
    referrer: text("referrer").notNull().default(""),
    landingUrl: text("landingUrl").notNull().default(""),
    deviceType: text("deviceType").notNull().default(""),
    browser: text("browser").notNull().default(""),
    os: text("os").notNull().default(""),
    country: text("country").notNull().default(""),
    city: text("city").notNull().default(""),
    ipAddress: text("ipAddress").notNull().default(""),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updatedAt", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => [index("user_sources_userId_idx").on(table.userId)],
);

// Video generation tasks (Seedance / KIE)
export const userTask = sqliteTable(
  "user_task",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("pending"),
    mode: text("mode").notNull(),
    model: text("model").notNull(),
    provider: text("provider").notNull().default("kie"),
    prompt: text("prompt").notNull().default(""),
    // Full SeedanceCreateTaskInput (mode + refs + settings)
    input: text("input", { mode: "json" })
      .notNull()
      .$defaultFn(() => ({})),
    // Null until the provider accepts the job (no fake pending IDs)
    providerTaskId: text("providerTaskId"),
    // TaskResultData: videos + optional frames/posterKey
    resultData: text("resultData", { mode: "json" })
      .notNull()
      .$defaultFn(() => ({})),
    errorMessage: text("errorMessage").notNull().default(""),
    errorCode: text("errorCode").notNull().default(""),
    creditCost: integer("creditCost").notNull().default(0),
    processingDurationMs: integer("processingDurationMs"),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updatedAt", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
    completedAt: integer("completedAt", { mode: "timestamp" }),
  },
  (table) => [
    index("user_tasks_userId_createdAt_idx").on(table.userId, table.createdAt),
    index("user_tasks_providerTaskId_idx").on(table.providerTaskId),
    index("user_tasks_status_updatedAt_idx").on(table.status, table.updatedAt),
  ],
);

// User feedback table
export const feedback = sqliteTable(
  "feedback",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("userId").references(() => user.id, { onDelete: "set null" }),
    email: text("email").notNull(),
    category: text("category").notNull(),
    message: text("message").notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [index("feedback_userId_idx").on(table.userId)],
);

// Type
export type SelectUser = typeof user.$inferSelect;
export type InsertUser = typeof user.$inferInsert;
export type SelectUserBalance = typeof userBalance.$inferSelect;
export type InsertUserBalance = typeof userBalance.$inferSelect;
export type SelectSubscription = typeof subscription.$inferSelect;
export type InsertSubscription = typeof subscription.$inferInsert;
export type SelectPayment = typeof payment.$inferSelect;
export type InsertPayment = typeof payment.$inferInsert;
export type SelectCreditHistory = typeof creditHistory.$inferSelect;
export type InsertCreditHistory = typeof creditHistory.$inferInsert;
export type SelectUserSource = typeof userSource.$inferSelect;
export type InsertUserSource = typeof userSource.$inferInsert;
export type SelectUserTask = typeof userTask.$inferSelect;
export type InsertUserTask = typeof userTask.$inferInsert;
export type SelectFeedback = typeof feedback.$inferSelect;
export type InsertFeedback = typeof feedback.$inferInsert;
