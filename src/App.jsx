import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import ServicesList from "./pages/admin-dashboard/ServicesList";
import ServiceDetails from "./pages/admin-dashboard/ServiceDetails";
import ComplaintsPage from "./pages/admin-dashboard/ComplaintsPage";
import ReactivatePage from "./pages/admin-dashboard/ReactivatePage";
import EmailPage from "./pages/admin-dashboard/EmailPage";
import NotFound from "./pages/NotFound";

import "./App.css";
import "./index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AppWrapper() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {!isLoginPage && <Navbar />}
      <div className="app-inner">
        {!isLoginPage && <Sidebar />}
        <div className="page-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={<Navigate to="/admin-dashboard/services" replace />}
            />
            <Route
              path="/admin-dashboard/services"
              element={
                <ProtectedRoute>
                  <ServicesList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard/services/:serviceId"
              element={
                <ProtectedRoute>
                  <ServiceDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard/reactivate"
              element={
                <ProtectedRoute>
                  <ReactivatePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard/email"
              element={
                <ProtectedRoute>
                  <EmailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard/complaints"
              element={
                <ProtectedRoute>
                  <ComplaintsPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
