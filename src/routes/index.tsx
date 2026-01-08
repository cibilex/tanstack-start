import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { createFileRoute } from '@tanstack/react-router'
import { createColumnHelper } from '@tanstack/react-table'
import { Trash } from 'lucide-react'
enum UserTypes {
  admin = 'admin',
  manager = 'manager',
  stuff = 'stuff',
}
type User = {
  id: number
  name: string
  type: UserTypes
}
const users: User[] = [
  {
    id: 1,
    type: UserTypes.admin,
    name: 'cibilex',
  },
  {
    id: 2,
    type: UserTypes.manager,
    name: 'manager',
  },
  {
    id: 3,
    type: UserTypes.stuff,
    name: 'stuff',
  },
]
const columnHelper = createColumnHelper<User>()

const columns = [
  columnHelper.accessor('name', {
    id: 'name',
    cell: (props) => <span>{props.getValue()}</span>,
    header: () => <span>Name</span>,
  }),
  columnHelper.accessor('type', {
    id: 'type',
    cell: (props) => <span>{props.getValue()}</span>,
    header: () => <span>Type</span>,
  }),
  columnHelper.display({
    id: 'actions',
    cell: () => (
      <Button variant="destructive" size="icon">
        <Trash />
      </Button>
    ),
    header: () => <span>Actions</span>,
  }),
]

function App() {
  return <DataTable<User, unknown> columns={columns} data={users}></DataTable>
}

export const Route = createFileRoute('/')({
  component: App,
  loader: () => {
    console.log('home page loader')
  },
})
