import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [masterPassword, setMasterPassword] = useState<string | null>(null);

  const handleLogin = (pwd: string) => {
    setMasterPassword(pwd);
  };

  const handleLogout = () => {
    setMasterPassword(null);
  };

  if (!masterPassword) {
    return <Login onLogin={handleLogin} />;
  }

  return <Dashboard masterPassword={masterPassword} onLogout={handleLogout} />;
}

export default App;
