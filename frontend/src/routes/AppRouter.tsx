import { Navigate, Route, Routes } from 'react-router-dom';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import OAuthRedirect from '../pages/Auth/OAuthRedirect';
import Dashboard from '../pages/Dashboard/Dashboard';
import Wallet from '../pages/Wallet/Wallet';
import TransactionsList from '../pages/Transactions/TransactionsList';
import TransactionDetails from '../pages/Transactions/TransactionDetails';
import TransferForm from '../pages/Transfer/TransferForm';
import FinancialAssistant from '../pages/Assistant/FinancialAssistant';
import KycVerification from '../pages/Assistant/KycVerification';
import UserProfile from '../pages/Profile/UserProfile';
import PrivateRoute from './PrivateRoute';

const AppRouter = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
    <Route path="/wallet" element={<PrivateRoute><Wallet /></PrivateRoute>} />
    <Route path="/transactions" element={<PrivateRoute><TransactionsList /></PrivateRoute>} />
    <Route path="/transactions/:id" element={<PrivateRoute><TransactionDetails /></PrivateRoute>} />
    <Route path="/transfer" element={<PrivateRoute><TransferForm /></PrivateRoute>} />
    <Route path="/assistant" element={<PrivateRoute><FinancialAssistant /></PrivateRoute>} />
    <Route path="/kyc" element={<PrivateRoute><KycVerification /></PrivateRoute>} />
    <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
    <Route path="/oauth-redirect" element={<OAuthRedirect />} />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);
export default AppRouter;