# TanStack Start

https://www.youtube.com/watch?v=G8D_n47rvoo&t=3615s

--eslint config:

```ts
//settings.json
"editor.formatOnSave": true,
"editor.defaultFormatter": "esbenp.prettier-vscode",
"editor.codeActionsOnSave": {
"source.fixAll.eslint": "explicit"
}
```

- TanStack Start is built on two main tools:
  - **TanStack Router**: Handles fully type-safe routing logic and provides advanced features such as file-based routing, route validation, data loaders/actions, and route preloading.
  - **Vite**: Serves as the underlying development and build tool, providing fast hot module replacement (HMR), efficient bundling, and a modern developer experience for both client and server code.
  - In addition to these core tools, developers can integrate other libraries as needed, such as Tailwind CSS, shadcn/ui, TanStack Query, TanStack Form, and other ecosystem tools.

Project files:

- `vite.config.ts`: This file defines the build and development configuration of the application.You must have notice that there is no explicit `@tanstack/router` Vite plugin configured. This is because TanStack Start integrates TanStack Router internally.If you need to customize the TanStack Router plugin behavior, you can pass options through the tanstackStart configuration:

```ts
tanstackStart({
  router: {
    routeToken: 'layout',
  },
}),

```

- `src/router.tsx`: This file is responsible for creating and configuring the application router.It must export a function called getRouter, which returns a configured TanStack Router instance.We can add tanstack router options such as `defaultNotFoundComponent` and `scrollRestoration`.
- `prettier.config.js`: This file controls code formatting rules for the project.For example, if you prefer longer lines, so i added `printWidth: 120` into this file.
- `__root.tsx`: As you may notice, the project does not include an `index.html` file or a `main.tsx` entry file.Instead, the entry point of the application is the `__root.tsx` file.It defines the base HTML document structure that will be used for every page.The Component section should look like below:

```ts
function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen">
        <Header />
        {children}

        <Scripts />
      </body>
    </html>
  )
}
```

- The html, head, and body elements are real HTML tags, not React abstractions.TanStack Start uses this component to generate the final index.html document during SSR.
- `HeadContent`: HeadContent is required to inject document-level metadata, such as `title` , `description`
- `Scripts`: Scripts is responsible for injecting the necessary script tags.
- After now on, we can use these features like below:

```ts
export const Route = createFileRoute('/')({
  component: App,
  head: () => ({
    meta: [
      {
        title: 'Home Page',
      },
      {
        name: 'description',
        content: 'This is the home page of the application',
      },
    ],
  }),
})
```

- As you know react projects are using `Strict` mode in development, that is trigger renders twice.Tanstack `src/client.tsx` file is optional and not defined by default.[Default file](https://tanstack.com/start/latest/docs/framework/react/guide/client-entry-point) is like below. So if we want to delete StrictMode,just declare the file and delete `StrictMode` component.

```ts
// src/client.tsx
import { StartClient } from '@tanstack/react-start/client'
import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'

hydrateRoot(
  document,
  <StrictMode>
    <StartClient />
  </StrictMode>,
)
```

### Execution Model

- TanStack Router isomorphic çalışır: aynı route, loader ve component kodu hem server hem client’ta çalışabilir. Ama ne zaman nerede çalışacağı execution model tarafından belirlenir.

```tsx
export const Route = createFileRoute('/users/')({
  loader: () => {
    console.log('users page loader')
  },
  component: RouteComponent,
})

function RouteComponent() {
  console.log('users page')
  return <div>Hello</div>
}
```

- Senaryo 1: `/users` sayfasında refresh:Bu initial request’tir → kontrol server’dadır.
  - `Server`: "users page loader" > "users page"
  - `Client (hydrate)`: "users page"
- Senaryo 2: Başka sayfadan `/users`’a gitmek
  - Bu client-side navigation’dır → server yoktur.
  - `Server`: hiçbir şey çalışmaz
  - `Client`: "users page loader" > "users page"
- Neden bu model çok önemli?
  - Daha hızlı ilk render
  - SEO avantajı
  - Daha az client yükü

- Tanstack Start’ta execution model’in özü şudur: Kod `isomorphictir` (aynı dosya hem client hem server’da çalışabilir) ama her kod her yerde çalışmamalıdır. DB, file system, secret, token, enum, private logic server’da kalmalı, browser’a sızmamalıdır.

- `createServerFn`: Her yerden çağrılabilir ama sadece server’da çalışır. Client’tan çağrıldığında otomatik olarak HTTP isteğine dönüşür, that is Remote Procedure Call(RPC).
- `createServerOnlyFn`:: Yanlışlıkla client’ta çağrılırsa runtime error fırlatır. Güvenlik için birebir.
- `createClientOnlyFn /  <ClientOnly>`: Server’da render edilmeye çalışılırsa patlar. window, localStorage gibi browser API’leri için.
- `useSuspenseQuery`: runs on the server during SSR when its data is required and will be streamed to the client as it resolves.
- `useQuery`: does not execute on the server; it will fetch on the client after hydration. Use this for data that is not required for SSR.
- **createServerFn nasıl çalışır?**: createServerFn ile tanımladığın fonksiyon compile-time’da ayrıştırılır. Client bundle’ına fonksiyonun implementasyonu girmez, sadece bir proxy girer. Client bu fonksiyonu çağırdığında Tanstack:
  - Bunun server function olduğunu bilir ve Normal bir JS çağrısı yerine HTTP request üretir.
  - Server bu request’i karşılar ve Result’ı JSON olarak geri döner.

```tsx
// src/routes/users.tsx
import { createServerFn } from '@tanstack/react-start'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, queryOptions } from '@tanstack/react-query'
import { listUsers } from '@/server/users'

export const listUsers = createServerFn({ method: 'GET' }).handler(async () => {
  // DB, secret, fs gibi şeyler burada serbest
  return [
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' },
  ]
})

const usersQuery = queryOptions({
  queryKey: ['users'],
  queryFn: listUsers,
})

export const Route = createFileRoute('/users')({
  component: UsersPage,
})

function UsersPage() {
  const { data, isPending } = useQuery(usersQuery)

  if (isPending) return <div>Loading...</div>
  return <pre>{JSON.stringify(data, null, 2)}</pre>
}
```

- **Senaryo 1: /users sayfasında refresh**: Bu bir initial request olduğu için kontrol server’dadır. Server sayfayı render eder ancak useQuery server tarafında fetch başlatmaz, yani listUsers çalışmaz. Sayfa client’a hydrate edildikten sonra useQuery devreye girer ve listUsers bir serverFn olduğu için client otomatik olarak /\_serverFn/<encoded> endpoint’ine HTTP request atar. Server fonksiyonu çalıştırır ve sonucu client’a döner.
- **Senaryo 2: Başka bir sayfadan /users’a gitmek**: Bu tamamen client-side navigation’dır. Server render sürecine dahil olmaz. useQuery çalıştığında TanStack, queryFn’in bir serverFn olduğunu anlar ve yine /\_serverFn/<encoded> endpoint’ine HTTP request oluşturur. Server fonksiyonu çalıştırır ve sonucu client’a gönderir.

RPC ile doğru fonksiyon nasıl bulunur?

- RPC ile oluşan istekte jwt token bulunur. Bunu decode ettiğimizde Client’ın attığı istekteki encoded path, hangi dosyadaki hangi export’un çalıştırılacağını gibi bilgiler bulunur ve böylece fonksiyon tanımlanır.

- Örnek istek: `http://localhost:3000/_serverFn/eyJmaWxlIjoiL0BpZC9zcmMvcm91dGVzL3VzZXJzL2luZGV4LnRzeD90c3Itc3BsaXQ9Y29tcG9uZW50JnRzci1kaXJlY3RpdmUtdXNlLXNlcnZlcj0iLCJleHBvcnQiOiJsaXN0VXNlcnNfY3JlYXRlU2VydmVyRm5faGFuZGxlciJ9?createServerFn`
- Decode edilmiş versiyonu:

```ts
{
  "file": "/src/routes/users/index.tsx",
  "export": "listUsers_createServerFn_handler"
}

```

Örnek 2: useSuspenseQuery ile Server’da Çalışan Query

```ts
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { Suspense } from 'react'

// some db, secure api call, etc. with server side logic
const listUsers = createServerFn().handler(async () => {
  await new Promise((resolve) => setTimeout(() => resolve({}), 2000))
  return [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Doe' },
    { id: 3, name: 'John Smith' },
    { id: 4, name: 'Jane Smith' },
  ]
})

const usersQuery = queryOptions({
  queryKey: ['users', 'list'],
  queryFn: listUsers,
  retry: false,
})

export const Route = createFileRoute('/users/')({
  component: RouteComponent,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>
  },
})

function UserList() {
  const { data } = useSuspenseQuery(usersQuery)

  return <div>User count: {data.length}</div>
}

function RouteComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserList />
    </Suspense>
  )
}
```

- **Senaryo 1: /users sayfasında refresh**:Bu bir initial request olduğu için kontrol server’dadır. Server route loader’ı çalıştırır ve prefetchQuery çağrısı sırasında listUsers gerçekten server’da çalışır. Data hazırlandıktan sonra data stream edilerek client’a gönderilir.Client tarafında useSuspenseQuery tekrar fetch atmaz; cache zaten doludur. Suspense fallback yalnızca stream süreci boyunca kısa bir an görünür.
- **Senaryo 2: Başka bir sayfadan /users’a gitmek**:Bu tamamen client-side navigation’dır. Server render sürecine dahil olmaz. Route loader client’ta çalışır ve prefetchQuery tetiklenir.Client, queryFn’in bir serverFn olduğunu anlar ve /\_serverFn/<encoded> endpoint’ine HTTP request atar. Server fonksiyonu çalıştırır ve sonucu client’a döner.Bu sırada useSuspenseQuery Suspense boundary’yi askıya alır ve Loading... gösterilir.

- **şu an bu kod nerede çalışıyor?**: Özellikle loglama, analytics, side-effect, browser API veya server-only işlemler için bu ayrım kritiktir

```ts
// Manuel kontrol (typeof window)
if (typeof window === 'undefined') {
  console.log('hi from server')
} else {
  console.log('hi from client')
}

// createIsomorphicFn ile niyet odaklı çözüm
const isomorphicFn = createIsomorphicFn()
  .server(() => console.log('hi from server'))
  .client(() => console.log('hi from client'))

isomorphicFn()
```

`createIsomorphicFn` is recommended way since:

- Server bundle oluşturulurken:
  - `.client()` tarafı tree-shake edilir, sadece `.server()` kodu kalır.
- Client bundle oluşturulurken:
  - `server()` tarafı bundle’a girmez, sadece `.client()` kodu kalır.
    `npm run build` ile `.output` dosyasında 2 folder bulunur.
- Yukarıdaki kodta `npm run build` dediğinizde `.output/server` içerindeki kısımda

```ts
if (typeof window === 'undefined') console.log('hi from server')
else console.log('hi from client')
const isomorphicFn = () => console.log('hi from server')
isomorphicFn()
```

gibi bir kod görmelisiniz. Gördüğünüz gibi .client kısmı server kısmı için silindi.

- `createServerFn` `method` seçeneğini alır ve default olarak GET tir.
  - `GET` → read-only, cacheable, query-style serverFn
  - `POST` → anything with input / side effects (create, update, delete)
- Ayrıca `inputValidator` ile run-time validasyon ve type-safe parametre aktarımı yapılabilir.

```ts
const listUsersSchema = z.object({
  email: z.email(),
})
// some db, secure api call, etc. with server side logic
const listUsers = createServerFn({ method: 'POST' })
  .inputValidator(listUsersSchema)
  .handler(({ data }) => {
    return data.email // type-safe
  })
```

- `throw notFound()` → İstenen kaynağın bulunamadığını belirtmek için 404 sayfasını tetikler.
- `throw redirect({ to: '/' })` → İsteği kesip kullanıcıyı belirtilen route’a yönlendirir.

### Environments:

- Sadece server tarafı ile ilgili environmentları kullanırken 2 yöntemimiz mevcut.

```ts
// createServerOnlyFn and prevent using this on client side
const apiKey = createServerOnlyFn(() => process.env.SECRET_KEY)

// ✅ Use inside server functins directly
const getUsersSecurely = createServerFn().handler(() => {
  const secret = process.env.SECRET // Server-only
  return fetch(`/api/users?key=${secret}`)
})
```

- **Hydration Mismatches**: If we use data that changes for client and server.We can use correct hydration methods like below:

```ts
// ❌ Different content server vs client
function CurrentTime() {
  return <div>{new Date().toLocaleString()}</div>
}

// ✅ Consistent rendering
function CurrentTime() {
  const [time, setTime] = useState<string>()

  useEffect(() => {
    setTime(new Date().toLocaleString())
  }, [])

  return <div>{time || 'Loading...'}</div>
}
```

- TanStack Start + Vite kullandığımızda environment variable’lar otomatik olarak iki dünyaya ayrılır: client ve server.`VITE_` prefix’i olan her değişken client bundle’a gömülür, olmayanlar sadece server’da kalır. Yani bu bir runtime kontrolü değil, build-time bir karardır.TanStack Start server condition olmadan hiçbir sensitive environment variable kullanma.

```bash
VITE_BASE_URL=http://localhost:5173
DB_URL=postgresql://my_user:my_password@localhost:5432/postgres
```

```ts
// src/env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Client-side environment variables
  readonly VITE_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Server-side environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly DB_URL: string
    }
  }
}

export {}
```
