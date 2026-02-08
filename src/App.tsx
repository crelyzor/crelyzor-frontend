import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import Layout from './layout/Layout';
import CommandPalette from './components/CommandPalette';
import SignIn from './pages/SignIn';
import Home from './pages/Home';
import CreateMeeting from './pages/CreateMeeting';
import Meetings from './pages/Meetings';
import Availability from './pages/Availability';
import PublicBooking from './pages/PublicBooking';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        {/* Global Command Palette */}
        <CommandPalette />

        <Routes>
          <Route path="/signin" element={<SignIn />} />

          {/* Main Routes with Layout */}
          <Route
            path="/"
            element={
              <Layout>
                <Home />
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
    </ThemeProvider>
  );
}

export default App;
