import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Citizen pages
import MyCases from './pages/citizen/MyCases';
import ComplaintForm from './pages/citizen/ComplaintForm';
import CaseDashboard from './pages/citizen/CaseDashboard';
import LawyerSelect from './pages/citizen/LawyerSelect';

// Lawyer pages
import LawyerDashboard from './pages/lawyer/LawyerDashboard';

// Misc
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Root redirect */}
          <Route path='/' element={<Navigate to='/login' replace />} />

          {/* Public routes */}
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />

          {/* Citizen-protected routes */}
          <Route element={<ProtectedRoute role='citizen' />}>
            <Route path='/dashboard' element={<MyCases />} />
            <Route path='/case/new' element={<ComplaintForm />} />
            <Route path='/case/:id' element={<CaseDashboard />} />
            <Route path='/case/:id/lawyer' element={<LawyerSelect />} />
          </Route>

          {/* Lawyer-protected routes */}
          <Route element={<ProtectedRoute role='lawyer' />}>
            <Route path='/lawyer/dashboard' element={<LawyerDashboard />} />
          </Route>

          {/* 404 catch-all */}
          <Route path='*' element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
