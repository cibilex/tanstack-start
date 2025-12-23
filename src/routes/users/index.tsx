import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { Suspense } from 'react'
import { z } from 'zod'

const listUsersSchema = z.object({
  email: z.email(),
})
// some db, secure api call, etc. with server side logic
const listUsers = createServerFn({ method: 'POST' })
  .inputValidator(listUsersSchema)
  .handler(({ data }) => {
    return data.email // type-safe
  })

const usersQuery = queryOptions({
  queryKey: ['users', 'list'],
  queryFn: () =>
    listUsers({
      data: {
        email: 'test@test.com',
      },
    }),
  retry: false,
})

export const Route = createFileRoute('/users/')({
  component: RouteComponent,
  errorComponent: ({ error }) => {
    console.log(error, 'err')

    return <div>Error: {error.message}</div>
  },
})

function UserList() {
  const { data } = useSuspenseQuery(usersQuery)

  return <div>User count: {data.email}</div>
}

function RouteComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserList />
    </Suspense>
  )
}
