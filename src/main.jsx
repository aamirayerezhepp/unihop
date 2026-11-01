import { createRoot } from 'react-dom/client';
import { AppStateProvider } from './state/AppState.jsx';
import App from './App.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <AppStateProvider>
    <App />
  </AppStateProvider>
);
