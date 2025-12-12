import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import BadgeView from './pages/BadgeView';
import IssuerDashboard from './pages/IssuerDashboard';

function App() {
  // Determine base path for GitHub Pages
  // If hosted at https://user.github.io/repo/, base should be '/repo/'
  // This can be set via vite config base + import.meta.env.BASE_URL
  const basename = import.meta.env.BASE_URL;

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/verify/:badgeId" element={<BadgeView />} />
          <Route path="/create" element={<IssuerDashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
