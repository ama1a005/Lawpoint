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
import Profile from './pages/citizen/Profile';

// Lawyer pages
import LawyerDashboard from './pages/lawyer/LawyerDashboard';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAllCases from './pages/admin/AdminAllCases';
import CaseReview from './pages/admin/CaseReview';
import AdminCaseView from './pages/admin/AdminCaseView';

// Misc
import NotFound from './pages/NotFound';
import Forbidden from './pages/Forbidden';

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
            <Route path='/case/:id/lawyer' element={<LawyerSelect />} />
            <Route path='/profile' element={<Profile />} />
          </Route>

          {/* Shared routes (citizen + lawyer can view case details) */}
          <Route element={<ProtectedRoute />}>
            <Route path='/case/:id' element={<CaseDashboard />} />
          </Route>

          {/* Lawyer-protected routes */}
          <Route element={<ProtectedRoute role='lawyer' />}>
            <Route path='/lawyer/dashboard' element={<LawyerDashboard />} />
          </Route>

          {/* Admin-protected routes */}
          <Route element={<ProtectedRoute role='admin' />}>
            <Route path='/admin/dashboard' element={<AdminDashboard />} />
            <Route path='/admin/cases' element={<AdminAllCases />} />
            <Route path='/admin/case/:id/review' element={<CaseReview />} />
            <Route path='/admin/case/:id' element={<AdminCaseView />} />
          </Route>

          {/* 403 Forbidden */}
          <Route path='/403' element={<Forbidden />} />

          {/* 404 catch-all */}
          <Route path='*' element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
