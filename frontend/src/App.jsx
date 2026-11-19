import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BloodDataProvider } from './context/BloodDataContext';

// Public & Auth Pages
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyPhonePage from './pages/auth/VerifyPhonePage';
import ApplicationUnderReviewPage from './pages/auth/ApplicationUnderReviewPage';
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordVerifyPage from './pages/auth/ResetPasswordVerifyPage';
import ResetPasswordNewPage from './pages/auth/ResetPasswordNewPage';
import ResetPasswordSuccessPage from './pages/auth/ResetPasswordSuccessPage';

// Hospital Pages
import HospitalDashboardPage from './pages/hospital/HospitalDashboardPage';
import HospitalEmergenciesListPage from './pages/hospital/HospitalEmergenciesListPage';
import HospitalEmergencyDetailPage from './pages/hospital/HospitalEmergencyDetailPage';
import HospitalInventoryPage from './pages/hospital/HospitalInventoryPage';
import HospitalSettingsPage from './pages/hospital/HospitalSettingsPage';

// Donor Pages
import DonorDashboardPage from './pages/donor/DonorDashboardPage';
import DonorAlertResponsePage from './pages/donor/DonorAlertResponsePage';
import DonorHistoryPage from './pages/donor/DonorHistoryPage';
import DonorProfilePage from './pages/donor/DonorProfilePage';

// Blood Bank Pages
import BloodBankDashboardPage from './pages/bloodbank/BloodBankDashboardPage';

// Admin Pages
import AdminOverviewPage from './pages/admin/AdminOverviewPage';

// 404 Page
import NotFoundPage from './pages/NotFoundPage';

export function App() {
  return (
    <AuthProvider>
      <BloodDataProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col font-sans text-stone-900 bg-[#FAF9F8]">
            <div className="flex-1 flex flex-col">
              <Routes>
                {/* Public Landing & Authentication */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify-phone" element={<VerifyPhonePage />} />
                <Route path="/application-status" element={<ApplicationUnderReviewPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/verify" element={<ResetPasswordVerifyPage />} />
                <Route path="/reset-password/new" element={<ResetPasswordNewPage />} />
                <Route path="/reset-password/success" element={<ResetPasswordSuccessPage />} />

                {/* Hospital Coordinator Portal */}
                <Route path="/hospital" element={<HospitalDashboardPage />} />
                <Route path="/hospital/emergencies" element={<HospitalEmergenciesListPage />} />
                <Route path="/hospital/emergencies/:id" element={<HospitalEmergencyDetailPage />} />
                <Route path="/hospital/inventory" element={<HospitalInventoryPage />} />
                <Route path="/hospital/settings" element={<HospitalSettingsPage />} />
                <Route path="/hospital/history" element={<DonorHistoryPage />} />

                {/* Donor Portal */}
                <Route path="/donor" element={<DonorDashboardPage />} />
                <Route path="/donor/history" element={<DonorHistoryPage />} />
                <Route path="/donor/profile" element={<DonorProfilePage />} />
                <Route path="/alert/:id" element={<DonorAlertResponsePage />} />

                {/* Blood Bank Portal */}
                <Route path="/bloodbank" element={<BloodBankDashboardPage />} />
                <Route path="/bloodbank/inventory" element={<HospitalInventoryPage />} />
                <Route path="/bloodbank/settings" element={<HospitalSettingsPage />} />
                <Route path="/bloodbank/history" element={<DonorHistoryPage />} />

                {/* Admin Console */}
                <Route path="/admin" element={<AdminOverviewPage />} />

                {/* 404 & Fallback */}
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </BloodDataProvider>
    </AuthProvider>
  );
}

export default App;
