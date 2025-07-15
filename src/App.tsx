import { useEffect } from 'react';
import './App.css';
import { TooltipProvider } from './components/ui/tooltip';
import AetherAppRouter from './routes';
import { Toaster } from 'sonner';

function App() {

    useEffect(() => {
    const stored = localStorage.getItem("aether_table_col");

    if (stored) {
      try {
        const parsed = JSON.parse(stored);

        const allHaveMapkey = Array.isArray(parsed) && parsed.every((item) => 'mapkey' in item);

        if (!allHaveMapkey) {
          localStorage.removeItem("aether_table_col");
        }
      } catch (err) {
        localStorage.removeItem("aether_table_col");
      }
    }
  }, []);

  return (
    <TooltipProvider>
      <Toaster richColors position="top-center" />
      <AetherAppRouter />
    </TooltipProvider>
  )
}

export default App
