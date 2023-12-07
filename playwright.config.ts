import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
	testDir: './source',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: 'html',
	use: {
		trace: 'on-first-retry'
	},
	timeout: 678000,
	projects: [
		{
			name: 'webkit',
			use: { ...devices['Desktop Safari'] }
		}
	]
})
