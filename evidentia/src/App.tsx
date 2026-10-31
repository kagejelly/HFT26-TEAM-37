import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import NewInvestigation from './pages/NewInvestigation';
import CaseOverview from './pages/CaseOverview';
import Evidence from './pages/Evidence';
import Timeline from './pages/Timeline';
import EventDetail from './pages/EventDetail';
import Reconstruction from './pages/Reconstruction';
import Report from './pages/Report';

export default function App() {
  return <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/app" element={<AppLayout />} >
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="investigations/new" element={<NewInvestigation />} />
      <Route path="investigations/:id" element={<CaseOverview />} />
      <Route path="investigations/:id/evidence" element={<Evidence />} />
      <Route path="investigations/:id/timeline" element={<Timeline />} />
      <Route path="investigations/:id/events/:eventId" element={<EventDetail />} />
      <Route path="investigations/:id/reconstruction" element={<Reconstruction />} />
      <Route path="investigations/:id/report" element={<Report />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
