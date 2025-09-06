import React from 'react';
import AppDisplayer from './components/AppDisplayer';
import { AuthProvider } from './components/auth/AuthContext';
import { PanelProvider } from './components/panel/PanelContext';
import { AnnotationProvider } from './components/annotations/AnnotationContext';
import Header from './components/layout/Header';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <PanelProvider>
        <AnnotationProvider>
          <div className="App">
            <Header />

            <main className="App-main">
              {/*This is the dedicated mount point for profile overlays*/}
              <div id="overlay-root"></div>
              
              <AppDisplayer />
            </main>
          </div>
        </AnnotationProvider>
      </PanelProvider>
    </AuthProvider>
  );
}

export default App;
