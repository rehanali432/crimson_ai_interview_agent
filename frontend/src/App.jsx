import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Interview from './pages/Interview';
import Feedback from './pages/Feedback';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/interview/:sessionId" element={<Interview />} />
        <Route path="/feedback/:sessionId" element={<Feedback />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
