import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import FullScreenLoader from "../components/feedback/FullScreenLoader";
import ErrorBoundary from "../components/feedback/ErrorBoundary";
import { useAuth } from "../contexts/AuthContext";

const AuthPage = lazy(() => import("../pages/AuthPage"));
const OverviewPage = lazy(() => import("../pages/OverviewPage"));
const AnalyticsPage = lazy(() => import("../pages/AnalyticsPage"));
const GitHubPage = lazy(() => import("../pages/GitHubPage"));
const LearningPage = lazy(() => import("../pages/LearningPage"));
const SkillsPage = lazy(() => import("../pages/SkillsPage"));
const ProjectsPage = lazy(() => import("../pages/ProjectsPage"));
const ArchitecturePage = lazy(() => import("../pages/ArchitecturePage"));
const SettingsPage = lazy(() => import("../pages/SettingsPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));

function App() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <FullScreenLoader label="Preparing your DevDNA workspace..." />;
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<FullScreenLoader label="Loading workspace..." />}>
        <Routes>
          <Route
            path="/auth"
            element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />}
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<OverviewPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="github" element={<GitHubPage />} />
            <Route path="learning" element={<LearningPage />} />
            <Route path="skills" element={<SkillsPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="architecture" element={<ArchitecturePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route
            path="*"
            element={
              isAuthenticated ? <NotFoundPage /> : <Navigate to="/auth" replace />
            }
          />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
