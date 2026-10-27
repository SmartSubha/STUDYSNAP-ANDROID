import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register Service Worker for offline capabilities
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('StudySnap Service Worker registered with scope: ', registration.scope);
      })
      .catch((err) => {
        console.error('StudySnap Service Worker registration failed: ', err);
      });
  });
} else if ('serviceWorker' in navigator) {
  // Also register in dev mode if needed, but safe check to let developer test it
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('StudySnap Service Worker registered in Dev Mode.');
      })
      .catch((err) => {
        console.error('Service worker failed in dev mode:', err);
      });
  });
}

