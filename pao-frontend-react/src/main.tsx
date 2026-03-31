import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import axios from 'axios'

// Global API Interceptors for Logging
axios.interceptors.response.use(
  (response) => {
      // Optional: log successful mutations if needed
      return response;
  },
  (error) => {
      const log = {
          source: 'FRONTEND',
          category: 'API_ERROR',
          level: 'ERROR',
          message: `Request failed: ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
          details: error.response ? JSON.stringify(error.response.data) : error.message
      };
      
      // Fire and forget log to admin
      if (!error.config.url.includes('/api/admin/logs')) {
          axios.post('/api/admin/logs', log).catch(() => {});
      }
      return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
