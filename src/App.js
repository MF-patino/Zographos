import React from 'react';
import AuthPage from './components/auth/AuthForm';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Zōgraphos</h1>
      </header>
      <main>
        <AuthPage />
      </main>
    </div>
  );
}

export default App;
