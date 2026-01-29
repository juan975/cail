import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import { NotificationsProvider } from './components/ui/Notifications';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NotificationsProvider>
      <App />
    </NotificationsProvider>
  </React.StrictMode>
);
