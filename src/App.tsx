import './App.css';
import { TooltipProvider } from './components/ui/tooltip';
import AetherAppRouter from './routes';
import { Toaster } from 'sonner';

function App() {

  return (
    <TooltipProvider>
      <Toaster richColors position="top-center" />
      <AetherAppRouter />
    </TooltipProvider>
  )
}

export default App
