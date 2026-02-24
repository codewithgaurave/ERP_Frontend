import { BrowserRouter as Router } from "react-router";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <Toaster position="top-right" />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
