type Identity<T> = { [P in keyof T]: T[P] }
type Replace<T, K extends keyof T, TReplace> = Identity<
	Pick<T, Exclude<keyof T, K>> & {
		[P in K]: TReplace
	}
>
type NewCapture = Replace<typeof captures.$inferInsert, 'screenshot', Buffer>
type Database = LibSQLDatabase<typeof schema>

export { NewCapture, Database }
