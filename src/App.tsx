import './App.css';
import AetherAppRouter from './routes';
import { Toaster } from 'sonner';

function App() {

  return (
    <>
      <Toaster richColors position="top-center" />
      <AetherAppRouter />
    </>
  )
}

export default App
