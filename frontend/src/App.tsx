import { Route, Routes, Navigate } from 'react-router-dom';

// context
import { OverlayProvider } from './context/overlay';

// components
import { Header } from './components/header/header';
import { PopupManager } from './components/popup-manager';

// @constant
import { sections } from './@constant/sections';

// hooks
import { useTheme } from './hooks/theme';

export function App() {

  const theme = useTheme() || localStorage.getItem("theme")
  
  return (
    <div className="App" data-theme={theme}>
      <OverlayProvider>
        <Header />
        <Routes>
          { sections.map((item, idx) => (<Route key={idx} path={`/${item.pathName}/*`} element={item.element} />)) }
          <Route path='*' element={<Navigate to={`/${sections[0].pathName}`} replace/>} />
        </Routes>
        {/*<LogView />*/}
        <PopupManager />
      </OverlayProvider>
    </div>
  );
}
