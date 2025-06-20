import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { ProjectList } from './pages/ProjectList';
import { ProjectDetail } from './pages/ProjectDetail';
import { CreateProject } from './pages/CreateProject';
import { Board } from './pages/Board';
import { BoardSelector } from './pages/BoardSelector';
import { EnhancedAnalytics } from './pages/EnhancedAnalytics';
import { WebhookManagement } from './components/WebhookManagement';
// import { TestPage } from './TestPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<ProjectList />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="projects/:id/board" element={<Board />} />
              <Route path="projects/new" element={<CreateProject />} />
              <Route path="board" element={<BoardSelector />} />
              <Route path="board/:projectId" element={<Board />} />
              <Route path="analytics" element={<EnhancedAnalytics />} />
              <Route 
                path="webhooks" 
                element={
                  <ProtectedRoute requiredRole="developer">
                    <WebhookManagement />
                  </ProtectedRoute>
                } 
              />
            </Route>
          </Routes>
          <Toaster position="top-right" />
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;