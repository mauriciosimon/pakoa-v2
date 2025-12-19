import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { Dashboard } from '@/pages/Dashboard'
import { Sales } from '@/pages/Sales'
import { Income } from '@/pages/Income'
import { Team } from '@/pages/Team'
import { Campaigns } from '@/pages/Campaigns'
import { Profile } from '@/pages/Profile'
import { AdminUsers } from '@/pages/admin/AdminUsers'
import { AdminProducts } from '@/pages/admin/AdminProducts'
import { AdminCycles } from '@/pages/admin/AdminCycles'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth()
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Main App Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/income" element={<Income />} />
        <Route path="/team" element={<Team />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/profile" element={<Profile />} />

        {/* Admin Routes */}
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <AdminProducts />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/cycles"
          element={
            <AdminRoute>
              <AdminCycles />
            </AdminRoute>
          }
        />
      </Route>

      {/* Login placeholder */}
      <Route
        path="/login"
        element={
          <div className="flex min-h-screen items-center justify-center">
            <p>Login page (placeholder)</p>
          </div>
        }
      />

      {/* 404 */}
      <Route
        path="*"
        element={
          <div className="flex min-h-screen items-center justify-center">
            <p>404 - Página no encontrada</p>
          </div>
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
