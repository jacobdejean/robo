import { Page } from '@playwright/test'
import yeast from 'yeast'
import { Database, Replace } from '../types'
import { identity, robo } from '..'
import { captures } from '../database/schema'
import { eq } from 'drizzle-orm'

type RoboProps = {
	page: Page
}

type NewCapture = Replace<typeof captures.$inferInsert, 'screenshot', Buffer>

export interface ScreenCapturingRoboProps extends RoboProps {}

export default function ScreenCapturingRobo(page: Page, db: Database) {
	const meta = identity('ScreenCapturingRobo')
	const depth = 5

	async function routine(url: URL) {
		const urlString = url.toString()

		console.log(`${meta.name} ${meta.id} navigating to ${urlString}`)
		await page.goto(urlString)

		const links = extractLinks(await page.content(), urlString)
			.map(link => {
				const https = link.startsWith('https://')
				const leadingSlash = link.startsWith('/')
				const noLeading = !https && !leadingSlash

				if ((leadingSlash || noLeading) && https)
					return `${url.origin}${noLeading ? '/' : ''}${link}`
				if (https) return link
			})
			.filter(link => link.startsWith('https://'))

		console.log(`${meta.name} ${meta.id} found ${links.length} links`)

		let i = 0
		for (const link of links) {
			const linkUrl = new URL(link)
			await routine(new URL(linkUrl.origin))
			i++
			if (i > depth) {
				break
			}
		}

		const result = await getCapture(urlString)
		const exists = result.length > 0
		if (exists) {
			return
		}

		console.log(`${meta.name} ${meta.id} capturing ${urlString}`)
		const buffer = await page.screenshot()
		console.log(`${meta.name} ${meta.id} saving buffer`)
		insertCapture(db, {
			uid: yeast(),
			url: urlString,
			screenshot: buffer,
			created_at: new Date().toISOString()
		})
	}

	async function getCapture(urlString: string) {
		const result = await db
			.select({
				uid: captures.uid,
				url: captures.url,
				created_at: captures.created_at
			})
			.from(captures)
			.where(eq(captures.url, urlString))
		return result
	}

	function extractLinks(html: string, url: string) {
		const matches = html.match(/<a[^>]+href="([^"]+)">/g) ?? []
		const links = matches.map(
			link => link.match(/href="([^"]+)"/)![1] ?? ''
		)
		//console.log(links)
		return links
	}

	const insertCapture = async (db: Database, capture: NewCapture) => {
		await db.insert(captures).values(capture)
	}

	return robo({ routine, meta })
}
