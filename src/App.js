import React from 'react';
import AppDisplayer from './components/AppDisplayer';
import { AuthProvider } from './components/auth/AuthContext';
import Header from './components/layout/Header';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Header />

        <main>
          <AppDisplayer />
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
