import { LibSQLDatabase } from 'drizzle-orm/libsql'
import { captures } from './database/schema'

type Identity<T> = { [P in keyof T]: T[P] }
type Replace<T, K extends keyof T, TReplace> = Identity<
	Pick<T, Exclude<keyof T, K>> & {
		[P in K]: TReplace
	}
>

type Database = LibSQLDatabase<typeof schema>

export { Identity, Replace, Database }
