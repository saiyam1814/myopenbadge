import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import BadgeView from './pages/BadgeView';
import IssuerDashboard from './pages/IssuerDashboard';
import BadgeGallery from './pages/BadgeGallery';
import Settings from './pages/Settings';
import AuthCallback from './pages/AuthCallback';

function App() {
  const basename = import.meta.env.BASE_URL;

  return (
    <Router basename={basename}>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/verify/:badgeId" element={<BadgeView />} />
          <Route path="/create" element={<IssuerDashboard />} />
          <Route path="/badges" element={<BadgeGallery />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
