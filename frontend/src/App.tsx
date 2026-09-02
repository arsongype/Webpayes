import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import AppRouter from './routes/AppRouter';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import NavbarMobile from './components/layout/NavbarMobile';
import Footer from './components/layout/Footer';
import NotificationLoader from './pages/Notification/NotificationLoader';
import ToastContainer, { type Toast } from './components/common/Toast/ToastContainer';
import { store } from './store/store';
import { useAuth } from './hooks/useAuth';
import { useState } from 'react';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [toasts, setToasts] = useState<Toast[]>([]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <Navbar />
      
      <div className="flex flex-1 pt-16">
        {/* Desktop Sidebar */}
        {isAuthenticated && <Sidebar />}
        
        {/* Main Content */}
        <main className={`flex-1 pb-32 lg:pb-0 ${isAuthenticated ? 'lg:ml-64' : ''}`}>
          <AppRouter />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isAuthenticated && <NavbarMobile />}

      {/* Footer */}
      <Footer />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} setToasts={setToasts} />
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <NotificationProvider>
              <AppContent />
            </NotificationProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;