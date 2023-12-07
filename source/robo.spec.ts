import { test, expect, Page } from '@playwright/test'
import routine from './robo'
import * as schema from './database/schema'
import { createClient } from '@libsql/client'
import { LibSQLDatabase, drizzle } from 'drizzle-orm/libsql'
import { captures } from './database/schema'
import yeast from 'yeast'
import { eq, sql } from 'drizzle-orm/sql'
import { identity, robo, run } from '.'
import ScreenCapturingRobo from './definitions/ScreenCapturingRobo'

console.log(`Connecting to database`)

const client = createClient({
	url: 'http://127.0.0.1:5668'
})

await client.execute(`
  create table if not exists captures (
    uid text primary key unique,
    url text not null,
    screenshot blob not null,
    created_at text not null
)`)

const db = drizzle(client, { schema })

const startUrl = 'https://news.ycombinator.com'

test('One robot', async ({ page }) => {
	const result = await run([ScreenCapturingRobo], page, db, new URL(startUrl))

	expect(false).toBe(false)
})
