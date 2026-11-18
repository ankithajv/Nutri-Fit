import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { Spinner } from './components/ui/Spinner';

// Pages
import { Welcome } from './pages/Welcome';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { LogMeal } from './pages/LogMeal';
import { MealResult } from './pages/MealResult';
import { DayAnalysis } from './pages/DayAnalysis';
import { WeeklyReport } from './pages/WeeklyReport';
import { Profile } from './pages/Profile';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <Spinner size="lg" className="text-[var(--color-accent)]" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <Spinner size="lg" className="text-[var(--color-accent)]" />
      </div>
    );
  }

  if (token) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Landing */}
            <Route path="/" element={<Welcome />} />

            {/* Auth Routes */}
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <Register />
                </PublicOnlyRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/log-meal"
              element={
                <ProtectedRoute>
                  <LogMeal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meal-result/:mealId"
              element={
                <ProtectedRoute>
                  <MealResult />
                </ProtectedRoute>
              }
            />
            <Route
              path="/day-analysis"
              element={
                <ProtectedRoute>
                  <DayAnalysis />
                </ProtectedRoute>
              }
            />
            <Route
              path="/weekly-report"
              element={
                <ProtectedRoute>
                  <WeeklyReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
