import { Route, Routes, Navigate } from 'react-router-dom';

// context
import { OverlayProvider } from './context/overlay';

// components
import Header from './components/header/header';

// @constant
import { sections } from './@constant/sections';

export function App() {
  return (
    <div className="App">
      <OverlayProvider>
        <Header />
        <Routes>
          { sections.map((item, idx) => (<Route key={idx} path={`/${item.pathName}/*`} element={item.element} />)) }
          <Route path='*' element={<Navigate to={`/${sections[0].pathName}`} replace/>} />
        </Routes>
      </OverlayProvider>
    </div>
  );
}
