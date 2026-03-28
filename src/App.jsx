// src/App.jsx
import { BrowserRouter } from 'react-router-dom';
import { useTutorData } from './hooks/useTutorData';
import Dashboard from './components/Dashboard';
import 'react-toastify/dist/ReactToastify.css'; 
import './App.css';

function App() {
  const database = useTutorData();

  return (
    <BrowserRouter>
      <Dashboard db={database} />;
    </BrowserRouter>
  );
}

export default App;