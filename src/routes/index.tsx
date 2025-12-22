import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })
function App() {
  console.log('App')
  return <div></div>
}
