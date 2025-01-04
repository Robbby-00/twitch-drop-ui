import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// App
import { App } from './App';

// Style
import './index.css';
import { DataProvider } from './context/data';

// Root
const root = createRoot(
  document.getElementById('root') as HTMLElement
);

// Render
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <DataProvider>
        <App />
      </DataProvider>
    </BrowserRouter>
  </React.StrictMode>
);

