import { useDB, users } from '~/server/db'

export default defineEventHandler(async (event) => {
  const db = useDB()

  const result = await db.query.users.findMany({
    columns: {
      id: true,
      username: true,
      displayName: true,
      role: true,
      createdAt: true,
      lastLoginAt: true
    },
    orderBy: (users, { asc }) => [asc(users.username)]
  })

  return result.map(user => ({
    id: user.id,
    username: user.username,
    displayName: user.displayName || user.username,
    role: user.role,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt
  }))
})
