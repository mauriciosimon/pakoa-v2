import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="md:pl-64">
        <div className="container mx-auto p-4 pt-16 md:p-6 md:pt-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
