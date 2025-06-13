import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout';
import { ProjectList } from './pages/ProjectList';
import { Board } from './pages/Board';
import { BoardSelector } from './pages/BoardSelector';
import { Analytics } from './pages/Analytics';
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
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<ProjectList />} />
            <Route path="projects/:id" element={<Board />} />
            <Route path="projects/new" element={<div>New Project (TODO)</div>} />
            <Route path="board" element={<BoardSelector />} />
            <Route path="board/:projectId" element={<Board />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
        </Routes>
        <Toaster position="top-right" />
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;