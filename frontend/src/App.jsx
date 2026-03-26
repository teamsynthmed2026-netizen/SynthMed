// App.jsx - Main application with routing & animations
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import SymptomCheckerPage from './pages/SymptomCheckerPage'
import FirstAidPage from './pages/FirstAidPage'
import DoctorsPage from './pages/DoctorsPage'
import AppointmentPage from './pages/AppointmentPage'
import ProfilePage from './pages/ProfilePage'

// Page wrapper for animations
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.35, ease: "easeOut" }}
  >
    {children}
  </motion.div>
)

// Protected route - redirects to login if not authenticated
function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div className="spinner" style={{ marginTop: '20vh' }}></div>
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const isPublicPage = ['/', '/login', '/register'].includes(location.pathname)
  
  return (
    <div className={isAuthenticated && !isPublicPage ? 'authenticated-layout' : ''}>
      {/* Show Sidebar only on authenticated app pages; otherwise show Navbar */}
      {isAuthenticated && !isPublicPage ? <Sidebar /> : <Navbar />}
      
      <main className="main-content">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
            <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
            <Route path="/register" element={<PageWrapper><RegisterPage /></PageWrapper>} />
            
            {/* These pages are accessible to both but we might want them protected now? 
                Keeping them accessible but they will show sidebar if logged in */}
            <Route path="/symptoms" element={<PageWrapper><SymptomCheckerPage /></PageWrapper>} />
            <Route path="/firstaid" element={<PageWrapper><FirstAidPage /></PageWrapper>} />
            <Route path="/doctors" element={<PageWrapper><DoctorsPage /></PageWrapper>} />
            
            <Route path="/dashboard" element={
              <PrivateRoute><PageWrapper><DashboardPage /></PageWrapper></PrivateRoute>
            } />
            <Route path="/appointments" element={
              <PrivateRoute><PageWrapper><AppointmentPage /></PageWrapper></PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute><PageWrapper><ProfilePage /></PageWrapper></PrivateRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
