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
import FitGramReal from './pages/FitGramReal';
import CreateSession from './pages/CreateSession';
import CreateFitGramPost from './pages/CreateFitGramPost';
import Logros from './pages/Logros';
import Perfil from './pages/Perfil';
import FitIA from './pages/FitIA';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import OnboardingEnforcer from './components/OnboardingEnforcer';
import WeightEvolution from './pages/WeightEvolution';
import PrivacySettings from './pages/PrivacySettings';
import UserPublicProfile from './pages/UserPublicProfile';

const App = () => {
  return (
    <>
      <OnboardingEnforcer />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/password-recovery" element={<PasswordRecovery />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/physical-data" element={<PhysicalData />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/privacy-settings" element={<PrivacySettings />} />
        <Route path="/evolucion-peso" element={<WeightEvolution />} />
        <Route path="/dashboard" element={<Main />} />
        <Route path="/entrenamientos" element={<Entrenamientos />} />
        <Route path="/calendario" element={<Calendario />} />
        <Route path="/fitgram/empty" element={<FitGramReal forceEmpty />} />
        <Route path="/fitgram/create" element={<CreateFitGramPost />} />
        <Route path="/fitgram/usuarios/:id" element={<UserPublicProfile />} />
        <Route path="/fitgram" element={<FitGramReal />} />
        <Route path="/comunidad" element={<Navigate to="/fitgram?tab=community" replace />} />
        <Route path="/usuarios/:id" element={<UserPublicProfile />} />
        <Route path="/logros" element={<Logros />} />
        <Route path="/fitia" element={<FitIA />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/crear-sesion" element={<CreateSession />} />
        <Route path="/sessiondetail" element={<SessionDetail />} />
        <Route path="/sessiondetail/:id" element={<SessionDetail />} />
        <Route path="/dashboard-old" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
};

export default App;
