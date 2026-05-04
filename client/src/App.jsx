import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Admin pages (Member C)
import AdminDashboard from './pages/admin/AdminDashboard';
import CaseReview from './pages/admin/CaseReview';
import AdminCaseView from './pages/admin/AdminCaseView';

// ── Protected Route ──────────────────────────────────────────────────────
function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/403" replace />;
  return children;
}

// ── Placeholder pages (Member B will replace these) ──────────────────────
function LoginPlaceholder() {
  return <div className="flex items-center justify-center min-h-screen bg-ice"><p className="text-body text-slate">Login page — implemented by Member B</p></div>;
}
function ForbiddenPage() {
  return <div className="flex items-center justify-center min-h-screen bg-ice"><p className="text-body text-slate">403 — Access Denied</p></div>;
}

// ── App ──────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={<LoginPlaceholder />} />
      <Route path="/register" element={<LoginPlaceholder />} />
      <Route path="/403"      element={<ForbiddenPage />} />

      {/* Admin routes — Member C */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/admin/case/:id/review" element={
        <ProtectedRoute role="admin"><CaseReview /></ProtectedRoute>
      } />
      <Route path="/admin/case/:id" element={
        <ProtectedRoute role="admin"><AdminCaseView /></ProtectedRoute>
      } />

      {/*
        Citizen & Lawyer routes — Member B adds here:

        <Route element={<ProtectedRoute role="citizen" />}>
          <Route path="/dashboard"        element={<MyCases />} />
          <Route path="/case/new"         element={<ComplaintForm />} />
          <Route path="/case/:id"         element={<CaseDashboard />} />
          <Route path="/case/:id/lawyer"  element={<LawyerSelect />} />
        </Route>

        <Route element={<ProtectedRoute role="lawyer" />}>
          <Route path="/lawyer/dashboard" element={<LawyerDashboard />} />
        </Route>
      */}

      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
