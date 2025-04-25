
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from './registerSW'

// Register the service worker as early as possible
registerSW();

createRoot(document.getElementById("root")!).render(<App />);
