import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { AssistantProvider } from '@/contexts/AssistantContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { AssistantButton, AssistantPanel } from '@/components/assistant'
import { DevUserSwitcher } from '@/components/dev/DevUserSwitcher'
import { Dashboard } from '@/pages/Dashboard'
import { Sales } from '@/pages/Sales'
import { Income } from '@/pages/Income'
import { Team } from '@/pages/Team'
import { Campaigns } from '@/pages/Campaigns'
import { CampaignDetail } from '@/pages/CampaignDetail'
import { Profile } from '@/pages/Profile'
import { Trophies } from '@/pages/Trophies'
import { World } from '@/pages/World'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { AdminUsers } from '@/pages/admin/AdminUsers'
import { AdminProducts } from '@/pages/admin/AdminProducts'
import { AdminCycles } from '@/pages/admin/AdminCycles'
import { AdminCampaigns } from '@/pages/admin/AdminCampaigns'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, isImpersonating } = useAuth()
  // Block admin routes when impersonating (read-only mode for agent views)
  if (!isAdmin || isImpersonating) {
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}

// Assistant components - only shown when authenticated
function AssistantWrapper() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return null

  return (
    <AssistantProvider>
      <AssistantButton />
      <AssistantPanel />
    </AssistantProvider>
  )
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
        {/* Agent Routes (also accessible by admin) */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/income" element={<Income />} />
        <Route path="/team" element={<Team />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/campaigns/:campaignId" element={<CampaignDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/trophies" element={<Trophies />} />
        <Route path="/world" element={<World />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/mundo"
          element={
            <AdminRoute>
              <World />
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
        <Route
          path="/admin/campaigns"
          element={
            <AdminRoute>
              <AdminCampaigns />
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
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <AppRoutes />
            <AssistantWrapper />
            <DevUserSwitcher />
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
