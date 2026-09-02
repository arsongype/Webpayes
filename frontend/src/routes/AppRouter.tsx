import { Navigate, Route, Routes } from 'react-router-dom';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import OAuthRedirect from '../pages/Auth/OAuthRedirect';
import Dashboard from '../pages/Dashboard/Dashboard';
import AdminDashboard from '../pages/Dashboard/AdminDashboard';
import AdminUsers from '../pages/Admin/AdminUsers';
import AdminMerchants from '../pages/Admin/AdminMerchants';
import AdminAffiliationRequests from '../pages/Admin/AdminAffiliationRequests';
import AdminRefunds from '../pages/Admin/AdminRefunds';
import AdminDisputes from '../pages/Admin/AdminDisputes';
import PaymentCategories from '../pages/Admin/PaymentCategories';
import Wallet from '../pages/Wallet/Wallet';
import TransactionsList from '../pages/Transactions/TransactionsList';
import TransactionDetails from '../pages/Transactions/TransactionDetails';
import TransferForm from '../pages/Transfer/TransferForm';
import FinancialAssistant from '../pages/Assistant/FinancialAssistant';
import KycVerification from '../pages/Assistant/KycVerification';
import QrCode from '../pages/QR/QrCode';
import UserProfile from '../pages/Profile/UserProfile';
import TwoFactorSetup from '../pages/Profile/TwoFactorSetup';
import Documentation from '../pages/Documentation';
import Support from '../pages/Support';
import Terms from '../pages/Terms';
import Privacy from '../pages/Privacy';
import FraudAlerts from '../pages/FraudAlerts';
import RiskDetail from '../pages/RiskDetail';
import MerchantProfile from '../pages/Merchant/MerchantProfile';
import MerchantRequest from '../pages/Merchant/MerchantRequest';
import MerchantSearch from '../pages/Merchant/MerchantSearch';
import MerchantSales from '../pages/Merchant/MerchantSales';
import PaymentMethods from '../pages/PaymentMethods/PaymentMethods';
import BillingInfo from '../pages/Billing/BillingInfo';
import Refunds from '../pages/Refunds/Refunds';
import Disputes from '../pages/Disputes/Disputes';
import ProductList from '../pages/Product/ProductList';
import ProductManage from '../pages/Product/ProductManage';
import MyOrders from '../pages/Order/MyOrders';
import MerchantOrders from '../pages/Order/MerchantOrders';
import PaymentPage from '../pages/Payment/PaymentPage';
import MerchantPortal from '../pages/Merchant/MerchantPortal';
import MerchantDashboard from '../pages/Merchant/MerchantDashboard';
import MerchantKYC from '../pages/Merchant/MerchantKYC';
import TwoFactorSettings from '../pages/Settings/TwoFactorSettings';
import NotFound from '../pages/Error/NotFound';
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';

const AppRouter = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
    <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
    <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
    <Route path="/admin/merchants" element={<AdminRoute><AdminMerchants /></AdminRoute>} />
    <Route path="/admin/affiliation-requests" element={<AdminRoute><AdminAffiliationRequests /></AdminRoute>} />
    <Route path="/admin/refunds" element={<AdminRoute><AdminRefunds /></AdminRoute>} />
    <Route path="/admin/disputes" element={<AdminRoute><AdminDisputes /></AdminRoute>} />
    <Route path="/admin/payment-categories" element={<AdminRoute><PaymentCategories /></AdminRoute>} />
    <Route path="/wallet" element={<PrivateRoute><Wallet /></PrivateRoute>} />
    <Route path="/transactions" element={<PrivateRoute><TransactionsList /></PrivateRoute>} />
    <Route path="/transactions/:id" element={<PrivateRoute><TransactionDetails /></PrivateRoute>} />
    <Route path="/transfer" element={<PrivateRoute><TransferForm /></PrivateRoute>} />
    <Route path="/assistant" element={<PrivateRoute><FinancialAssistant /></PrivateRoute>} />
    <Route path="/kyc" element={<PrivateRoute><KycVerification /></PrivateRoute>} />
    <Route path="/qr" element={<QrCode />} />
    <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
    <Route path="/two-factor-setup" element={<PrivateRoute><TwoFactorSetup /></PrivateRoute>} />
    <Route path="/fraud-alerts" element={<PrivateRoute><FraudAlerts /></PrivateRoute>} />
    <Route path="/risk/:transactionId" element={<PrivateRoute><RiskDetail /></PrivateRoute>} />
    <Route path="/merchant/profile" element={<PrivateRoute><MerchantProfile /></PrivateRoute>} />
    <Route path="/merchant/request" element={<PrivateRoute><MerchantRequest /></PrivateRoute>} />
    <Route path="/merchants/search" element={<PrivateRoute><MerchantSearch /></PrivateRoute>} />
    <Route path="/merchant/sales" element={<PrivateRoute><MerchantSales /></PrivateRoute>} />
    <Route path="/products" element={<PrivateRoute><ProductList /></PrivateRoute>} />
    <Route path="/products/manage" element={<PrivateRoute><ProductManage /></PrivateRoute>} />
    <Route path="/orders/my" element={<PrivateRoute><MyOrders /></PrivateRoute>} />
    <Route path="/orders/merchant" element={<PrivateRoute><MerchantOrders /></PrivateRoute>} />
    <Route path="/payment-methods" element={<PrivateRoute><PaymentMethods /></PrivateRoute>} />
    <Route path="/payment" element={<PrivateRoute><PaymentPage /></PrivateRoute>} />
    <Route path="/merchant/portal" element={<PrivateRoute><MerchantPortal /></PrivateRoute>} />
    <Route path="/merchant/dashboard" element={<PrivateRoute><MerchantDashboard /></PrivateRoute>} />
    <Route path="/merchant/kyc" element={<PrivateRoute><MerchantKYC /></PrivateRoute>} />
    <Route path="/settings/two-factor" element={<PrivateRoute><TwoFactorSettings /></PrivateRoute>} />
    <Route path="/billing" element={<PrivateRoute><BillingInfo /></PrivateRoute>} />
    <Route path="/refunds" element={<PrivateRoute><Refunds /></PrivateRoute>} />
    <Route path="/disputes" element={<PrivateRoute><Disputes /></PrivateRoute>} />
    <Route path="/docs" element={<Documentation />} />
    <Route path="/support" element={<Support />} />
    <Route path="/terms" element={<Terms />} />
    <Route path="/privacy" element={<Privacy />} />
    <Route path="/oauth-redirect" element={<OAuthRedirect />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);
export default AppRouter;
