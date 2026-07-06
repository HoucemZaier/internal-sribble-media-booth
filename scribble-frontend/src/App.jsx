import './App.css'
import Camera from "./components/Camera";
import Login from './pages/login'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/camera" element={<Camera />} />
            </Routes>
        </Router>
    );
}

export default App
