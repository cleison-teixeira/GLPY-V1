import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import './index.css';

const root = createRoot(document.getElementById('root')!);

if (window.location.pathname === '/admin') {
  // Rota admin completamente isolada — App nunca é montado
  root.render(
    <StrictMode>
      <AdminPanel onNavigate={() => { window.location.href = '/'; }} />
    </StrictMode>,
  );
} else {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
