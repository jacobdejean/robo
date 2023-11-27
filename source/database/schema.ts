import { sql } from 'drizzle-orm'
import { text, integer, sqliteTable, blob } from 'drizzle-orm/sqlite-core'

export const captures = sqliteTable('captures', {
	uid: text('uid').primaryKey().unique(),
	url: text('url').notNull(),
	screenshot: blob('screenshot').notNull(),
	created_at: text('created_at').notNull()
})
