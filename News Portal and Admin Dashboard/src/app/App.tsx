import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AppProvider } from './context/AppContext';
import { Toaster } from 'sonner';
import '../styles/fonts.css';

export default function App() {
  return (
    <AppProvider>
      <Toaster position="top-center" richColors />
      <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <RouterProvider router={router} />
      </div>
    </AppProvider>
  );
}
