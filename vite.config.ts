
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Specifically define only the required environment variable
    // to avoid leaking secrets or crashing the browser with the full process.env object
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});
