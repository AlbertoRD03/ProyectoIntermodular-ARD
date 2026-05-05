import { Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import PasswordRecovery from './pages/PasswordRecovery';
import ResetPassword from './pages/ResetPassword';
import PhysicalData from './pages/PhysicalData';
import Register from './pages/Register';
import Main from './pages/Main';
import Entrenamientos from './pages/Entrenamientos';
import Calendario from './pages/Calendario';
import SessionDetail from './pages/SessionDetail';
import FitGram from './pages/FitGram';
import CreateSession from './pages/CreateSession';
import CreateFitGramPost from './pages/CreateFitGramPost';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/password-recovery" element={<PasswordRecovery />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/physical-data" element={<PhysicalData />} />
      <Route path="/dashboard" element={<Main />} />
      <Route path="/entrenamientos" element={<Entrenamientos />} />
      <Route path="/calendario" element={<Calendario />} />
      <Route path="/fitgram/empty" element={<FitGram forceEmpty />} />
      <Route path="/fitgram/create" element={<CreateFitGramPost />} />
      <Route path="/fitgram" element={<FitGram />} />
      <Route path="/crear-sesion" element={<CreateSession />} />
      <Route path="/sessiondetail" element={<SessionDetail />} />
      <Route path="/sessiondetail/:id" element={<SessionDetail />} />
      <Route path="/dashboard-old" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
