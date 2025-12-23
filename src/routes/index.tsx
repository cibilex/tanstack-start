import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: App,
  loader: () => {
    console.log('home page loader')
  },
})
function App() {
  console.log('home page')
  return <div>Home page</div>
}
