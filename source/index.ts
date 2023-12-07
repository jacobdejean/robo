import { Page } from '@playwright/test'
import yeast from 'yeast'
import { Database } from './types'

type Robo = {
	meta: RoboMeta
	routine: RoutineFn
}
type RoboInit = Partial<Robo>
type RoutineFn = (url: URL) => Promise<void>
type RoboMeta = {
	id: string
	name: string
}

function robo(init: RoboInit): Robo {
	const fallbackFn = async () => {}
	return {
		routine: init.routine ?? fallbackFn,
		meta: init.meta ?? identity('robo')
	}
}

function navigate(robo: Robo, url: URL) {
	robo.routine(url)
}

type RoboFn = (page: Page, db: Database) => Robo
type Group = {
	id: string
	name: string
	robos: Robo[]
}

async function run(
	robos: RoboFn[],
	page: Page,
	db: Database,
	url: URL,
	group?: Group
) {
	for (const roboFn of robos) {
		const robo = roboFn(page, db)
		try {
			await robo.routine(url)
			status(`${robo.meta.name} finished routine`, false)
		} catch (error) {
			status(`${robo.meta.name} failed routine`, true)
			continue
		}
	}

	function status(message: string, error: boolean) {
		return {
			message,
			error
		}
	}
}

function identity(name: string) {
	return {
		id: yeast(),
		name
	}
}

export { Robo, RoboInit, RoutineFn, robo, navigate, RoboFn, run, identity }
