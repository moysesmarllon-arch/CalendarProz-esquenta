import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initGA4 } from './utils/analytics';

// Inicializar o GA4 antes da primeira renderização
initGA4();

createRoot(document.getElementById('root')!).render(<App />);
