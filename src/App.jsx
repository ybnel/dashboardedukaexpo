import React, { useEffect } from 'react'
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet
} from 'react-router-dom'
import { useStore } from './store/useStore'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AddLead from './pages/AddLead'
import SelectClass from './pages/SelectClass'
import Checkout from './pages/Checkout'
import Success from './pages/Success'
import LeadsList from './pages/LeadsList'
import Navbar from './components/Navbar'

// Layout for protected pages
const ProtectedLayout = () => {
  const salesRep = useStore((state) => state.salesRep)
  if (!salesRep) {
    return <Navigate to="/login" replace />
  }
  return (
    <div className="pb-24 relative min-h-screen">
      <Outlet />
      <Navbar />
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <ProtectedLayout />,
    children: [
      { path: '/', element: <Dashboard /> },
      { path: '/add-lead', element: <AddLead /> },
      { path: '/leads', element: <LeadsList /> },
      { path: '/select-class', element: <SelectClass /> },
      { path: '/checkout', element: <Checkout /> },
      { path: '/success', element: <Success /> },
    ],
  }
])

function App() {
  const salesRep = useStore((state) => state.salesRep)
  const logout = useStore((state) => state.logout)

  useEffect(() => {
    let timeoutId;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      // Auto logout after 30 minutes of inactivity (30 * 60 * 1000)
      timeoutId = setTimeout(() => {
        if (salesRep) {
          logout();
          // The ProtectedRoute will automatically redirect to /login
          // since salesRep will become null
        }
      }, 30 * 60 * 1000);
    };

    // Events that count as user activity
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];

    // Setup listeners only if user is logged in
    if (salesRep) {
      events.forEach(event => document.addEventListener(event, resetTimer));
      resetTimer(); // Initialize timer
    }

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => document.removeEventListener(event, resetTimer));
    };
  }, [salesRep, logout]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Only show the warning if the user is already logged in (working)
      if (salesRep) {
        e.preventDefault()
        e.returnValue = '' // this shows the browser's default warning
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [salesRep])

  return (
    <div className="min-h-screen bg-slate-50 relative selection:bg-brand selection:text-white">
      {/* Background Decorator for Premium Expo Look */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-400/20 blur-[100px] rounded-full"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl mx-auto min-h-screen">
        <RouterProvider router={router} />
      </div>
    </div>
  )
}

export default App
