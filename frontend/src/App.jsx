import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Tickets from './pages/Tickets';
import TicketDetailPage from './pages/TicketDetailPage';
import CreateTicket from './pages/CreateTicket';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Tickets /></PrivateRoute>} />
        <Route path="/tickets/new" element={<PrivateRoute><CreateTicket /></PrivateRoute>} />
        <Route path="/tickets/:id" element={<PrivateRoute><TicketDetailPage /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;