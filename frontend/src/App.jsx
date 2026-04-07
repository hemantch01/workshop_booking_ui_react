import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ActivationPage from './pages/ActivationPage'
import DashboardPage from './pages/DashboardPage'
import ProposeWorkshop from './pages/ProposeWorkshop'
import WorkshopTypeList from './pages/WorkshopTypeList'
import WorkshopTypeDetails from './pages/WorkshopTypeDetails'
import AddWorkshopType from './pages/AddWorkshopType'
import EditWorkshopType from './pages/EditWorkshopType'
import WorkshopDetails from './pages/WorkshopDetails'
import ProfilePage from './pages/ProfilePage'
import ViewProfile from './pages/ViewProfile'
import ChangePassword from './pages/ChangePassword'
import PublicStats from './pages/PublicStats'
import TeamStats from './pages/TeamStats'

function AppRoutes() {
  const { user, loading } = useAuth()
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/login" element={user && !loading ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/activate/:key?" element={<ActivationPage />} />
        <Route path="/statistics" element={<PublicStats />} />
        <Route path="/statistics/team" element={<ProtectedRoute><TeamStats /></ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/workshops/propose" element={<ProtectedRoute><ProposeWorkshop /></ProtectedRoute>} />
        <Route path="/workshops/types" element={<ProtectedRoute><WorkshopTypeList /></ProtectedRoute>} />
        <Route path="/workshops/types/add" element={<ProtectedRoute><AddWorkshopType /></ProtectedRoute>} />
        <Route path="/workshops/types/:id" element={<ProtectedRoute><WorkshopTypeDetails /></ProtectedRoute>} />
        <Route path="/workshops/types/:id/edit" element={<ProtectedRoute><EditWorkshopType /></ProtectedRoute>} />
        <Route path="/workshops/:id" element={<ProtectedRoute><WorkshopDetails /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/profile/:userId" element={<ProtectedRoute><ViewProfile /></ProtectedRoute>} />
        <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background font-sans antialiased">
        <AppRoutes />
      </div>
    </AuthProvider>
  )
}

export default App
