
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerServiceWorker } from './registerSW'

// Register the service worker as early as possible
registerServiceWorker();

createRoot(document.getElementById("root")!).render(<App />);
