import { test, expect } from '@playwright/test'
import routine from './robo'
import * as schema from './database/schema'
import { createClient } from '@libsql/client'
import { LibSQLDatabase, drizzle } from 'drizzle-orm/libsql'
import { captures } from './database/schema'
import yeast from 'yeast'
import { eq, sql } from 'drizzle-orm/sql'

console.log(`Connecting to database`)

const client = createClient({
	url: 'http://127.0.0.1:8080'
})

await client.execute(`
  create table if not exists captures (
    uid text primary key unique,
    url text not null,
    screenshot blob not null,
    created_at text not null
)`)

const db = drizzle(client, { schema })

const startUrl = 'https://bun.sh'

test('robo', async ({ page }) => {
	await page.goto(startUrl)

	await routine(page, page.url())
})
