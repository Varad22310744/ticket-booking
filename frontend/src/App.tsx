import { Routes, Route, Link } from 'react-router-dom';
import { Ticket, CalendarDays, User as UserIcon, LogOut, LayoutDashboard } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import EventsPage from './pages/EventsPage';
import SeatMapPage from './pages/SeatMapPage';
import MyBookingsPage from './pages/MyBookingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WaitlistOfferPage from './pages/WaitlistOfferPage';
import OrganiserDashboard from './pages/OrganiserDashboard';

function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  
  return (
    <nav className="relative z-10 glass border-b border-white/10 sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-white hover:text-brand-400 transition-colors">
            <Ticket className="w-8 h-8 text-brand-500" />
            <span className="font-bold text-xl tracking-tight">PremiumTix</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
              <CalendarDays className="w-4 h-4" />
              Events
            </Link>
            
            {isAuthenticated ? (
              <>
                {user?.role === 'customer' && (
                  <Link to="/my-bookings" className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                    <UserIcon className="w-4 h-4" />
                    My Tickets
                  </Link>
                )}
                {user?.role === 'organiser' && (
                  <Link to="/organiser" className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}
                <button 
                  onClick={logout}
                  className="flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors ml-4 pl-4 border-l border-white/10"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/10">
                <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-lg transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-[url('https://images.unsplash.com/photo-1540839045388-75c60205216e?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center bg-fixed">
        <div className="absolute inset-0 bg-dark-900/90 backdrop-blur-sm z-0"></div>
        
        <Navigation />

        <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* General Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<EventsPage />} />
            </Route>
            
            {/* Customer Routes */}
            <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
              <Route path="/events/:eventId" element={<SeatMapPage />} />
              <Route path="/my-bookings" element={<MyBookingsPage />} />
              <Route path="/waitlist-offer/:waitlistId" element={<WaitlistOfferPage />} />
            </Route>

            {/* Organiser Routes */}
            <Route element={<ProtectedRoute allowedRoles={['organiser', 'admin']} />}>
              <Route path="/organiser" element={<OrganiserDashboard />} />
            </Route>
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
