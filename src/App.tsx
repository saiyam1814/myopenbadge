import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import BadgeView from './pages/BadgeView';
import IssuerDashboard from './pages/IssuerDashboard';

function App() {
  const basename = import.meta.env.BASE_URL;

  return (
    <Router basename={basename}>
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
