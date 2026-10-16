import { Link, Outlet, Route, Routes } from 'react-router-dom'

import HomePage from '@/pages/HomePage'
import ItemPage from '@/pages/ItemPage'
import NotFoundPage from '@/pages/NotFoundPage'

function Layout() {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-4xl items-center px-4">
          <Link to="/" className="font-semibold">
            My App
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

// All routes live here. The pages below are examples: replace them with your own.
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/items/:id" element={<ItemPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
