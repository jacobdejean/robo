import { Page } from '@playwright/test'
import { captures } from './database/schema'
import yeast from 'yeast'
import { NewCapture, Database } from './types'

const getLinks = async (url: string) => {
	url = trim(url)
	const response = await fetch(url)
	const html = await response.text()
	const links = extractLinks(html, url)
		.filter(link => link !== url)
		.filter(link => link.startsWith('http'))
		.filter((link, index, array) => array.indexOf(link) === index)
		.map(trim)
	return links
}

const getLinksRecursive = async (url: string, depth = 1): Promise<string[]> => {
	const links = await getLinks(url)
	if (depth === 1) {
		return links
	}
	const linkPromises = links.map(link => getLinksRecursive(link, depth - 1))
	const nestedLinks = await Promise.all(linkPromises)
	return links.concat(...nestedLinks)
}

const trim = (url: string) => {
	return url.replace(/\/$/, '')
}

const routine = async (page: Page, db: Database, url: string) => {
	console.time('Routine took')
	const links = await getLinksRecursive(url, 2)
	console.timeEnd('Routine took')

	for (const link of links) {
		console.log(`Navigating to ${link}`)

		try {
			await page.goto(link)
		} catch (error) {
			console.log(`Failed to navigate to ${link}`)
			continue
		}

		if (page.url() !== link) {
			console.log(`Landed on ${page.url()}`)
		}

		const result = await db
			.select({
				uid: captures.uid,
				url: captures.url,
				created_at: captures.created_at
			})
			.from(captures)
			.where(eq(captures.url, link))
		const exists = result.length > 0

		if (exists) {
			console.log(`Url already captured. Skipping`)
			continue
		}

		console.log(`Capturing`)

		const screenshot = await page.screenshot({
			fullPage: true
		})

		const capture = {
			uid: yeast(),
			url: link,
			screenshot,
			created_at: new Date().toISOString()
		}

		console.log(`Saving capture ${capture.uid}`)

		await insertCapture(capture)
	}
}

const insertCapture = async (capture: NewCapture) => {
	await db.insert(captures).values(capture)
}

function extractLinks(html: string, url: string) {
	const matches = html.match(/<a[^>]+href="([^"]+)">/g) ?? []
	const links = matches.map(link => link.match(/href="([^"]+)"/)![1] ?? '')
	return links
}

async function asfd() {}

export default routine
