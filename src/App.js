import React from 'react';
import AuthForm from './components/auth/AuthForm';
import { AuthProvider } from './components/auth/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <header className="App-header">
          <h1>Zōgraphos</h1>
        </header>
        <main>
          <AuthForm />
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
