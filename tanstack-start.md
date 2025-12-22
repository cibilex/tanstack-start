# TanStack Start

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
