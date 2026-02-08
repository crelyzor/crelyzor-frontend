import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layout/Layout';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import CreateMeeting from './pages/CreateMeeting';
import Meetings from './pages/Meetings';
import Availability from './pages/Availability';
import PublicBooking from './pages/PublicBooking';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<SignIn />} />
        
        {/* Authenticated Routes with Layout */}
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/meetings"
          element={
            <Layout>
              <Meetings />
            </Layout>
          }
        />
        <Route
          path="/meetings/create"
          element={
            <Layout>
              <CreateMeeting />
            </Layout>
          }
        />
        <Route
          path="/availability"
          element={
            <Layout>
              <Availability />
            </Layout>
          }
        />
        
        {/* Public Routes (No Layout) */}
        <Route path="/book/:shareToken" element={<PublicBooking />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
