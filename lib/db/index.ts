import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Create the connection string from environment variables
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required')
}

// Create postgres client
const client = postgres(connectionString)

// Create drizzle instance
export const db = drizzle(client, { schema })

// Export schema for use in components
export * from './schema'