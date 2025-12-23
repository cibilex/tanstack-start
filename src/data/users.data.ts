import { createServerFn } from '@tanstack/react-start'

export const userList = createServerFn({ method: 'GET' }).handler(async () => {
  return [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Doe' },
    { id: 3, name: 'John Smith' },
    { id: 4, name: 'Jane Smith' },
  ]
})
