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

      const isArray = Array.isArray(parsed);
      const allHaveMapkey = isArray && parsed.every((item) => 'mapkey' in item);

      if (!allHaveMapkey) {
        localStorage.removeItem("aether_table_col");
      } else {
        const filtered = parsed.filter((item) => item.mapkey !== "agent_number");

        localStorage.setItem("aether_table_col", JSON.stringify(filtered));
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
