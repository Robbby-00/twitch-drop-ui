import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// app
import { App } from './App';

// context
import { DataProvider } from './context/data';
import { SettingProvider } from './context/setting';

// preload
import './hooks/api';

// style
import './index.css';

// Root
const root = createRoot(
  document.getElementById('root') as HTMLElement
);

// Render
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <SettingProvider>
        <DataProvider>
          <App />
        </DataProvider>
      </SettingProvider>
    </BrowserRouter>
  </React.StrictMode>
);

