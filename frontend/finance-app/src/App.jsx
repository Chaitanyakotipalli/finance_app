import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

import Home from './pages/Home.jsx';
import Transaction from './pages/Transaction.jsx';
import Analysis from './pages/Analysis.jsx';
import Income_Analysis from './pages/Income_Analysis.jsx';
import Expense_Analysis from './pages/Expense_Analysis.jsx';
import CSV_Analysis from './pages/CSV_Analysis.jsx';
import Navbar from './components/Navbar.jsx';
import AuthPage from './pages/AuthPage.jsx';
import './App.css';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Check if user is already logged in
    const userId = localStorage.getItem('user_id');
    console.log('Checking stored user_id:', userId); // Debug log
    setLoggedIn(!!userId);
    setLoading(false);

    // Optional: Sync login across tabs
    const handleStorageChange = (e) => {
      if (e.key === 'user_id') {
        const storedId = localStorage.getItem('user_id');
        console.log('Storage changed, user_id:', storedId); // Debug log
        setLoggedIn(!!storedId);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    console.log('Logging out...'); // Debug log
    localStorage.removeItem('user_id');
    localStorage.removeItem('name');
    setLoggedIn(false);
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen">
      {loggedIn && (
        <aside className="w-70 bg-gray-100 p-2 border-r">
          <Navbar setLoggedIn={setLoggedIn} onLogout={handleLogout} />
        </aside>
      )}

      <main className="flex-3 overflow-y-auto">
        <Routes>
          {loggedIn ? (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/transactions" element={<Transaction />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/income-analysis" element={<Income_Analysis />} />
              <Route path="/expense-analysis" element={<Expense_Analysis />} />
              <Route path="/csv-analysis" element={<CSV_Analysis />} />
              <Route path="/auth" element={<Navigate to="/" />} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          ) : (
            <>
              <Route path="/auth" element={<AuthPage setLoggedIn={setLoggedIn} />} />
              <Route path="*" element={<Navigate to="/auth" />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  );
}

export default App;