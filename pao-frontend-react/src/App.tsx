import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { SearchProvider } from './context/SearchContext';
import { UserProvider } from './context/UserContext';
import './index.css';

// Direct imports for max reliability during debugging
import LeadsPage from './pages/Leads/LeadsPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import PeopleOrgPage from './pages/PeopleOrg/PeopleOrgPage';
import DeveloperPage from './pages/Developer/DeveloperPage';
import PrepPage from './pages/Preparation/PrepPage';
import ResumesPage from './pages/Resumes/ResumesPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SearchProvider>
            <UserProvider>
              <Router>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/leads" element={<LeadsPage />} />
                  <Route path="/resumes" element={<ResumesPage />} />
                  <Route path="/prep" element={<PrepPage />} />
                  <Route path="/people-org" element={<PeopleOrgPage />} />
                  <Route path="/developer" element={<DeveloperPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              </Router>
            </UserProvider>
          </SearchProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
