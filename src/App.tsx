import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LazyRoute } from "@/components/LazyRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy load heavy pages
const Appointments = lazy(() => import("./pages/Appointments"));
const Doctors = lazy(() => import("./pages/Doctors"));
const Announcements = lazy(() => import("./pages/Announcements"));
const Prescriptions = lazy(() => import("./pages/Prescriptions"));
const Schedule = lazy(() => import("./pages/Schedule"));
const Patients = lazy(() => import("./pages/Patients"));
const PostAnnouncement = lazy(() => import("./pages/PostAnnouncement"));
const UploadPrescription = lazy(() => import("./pages/UploadPrescription"));
const Profile = lazy(() => import("./pages/Profile"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Index />} />
            <Route path="/appointments" element={<ProtectedRoute><LazyRoute><Appointments /></LazyRoute></ProtectedRoute>} />
            <Route path="/doctors" element={<LazyRoute><Doctors /></LazyRoute>} />
            <Route path="/announcements" element={<LazyRoute><Announcements /></LazyRoute>} />
            <Route path="/prescriptions" element={<ProtectedRoute><LazyRoute><Prescriptions /></LazyRoute></ProtectedRoute>} />
            <Route path="/schedule" element={<ProtectedRoute><LazyRoute><Schedule /></LazyRoute></ProtectedRoute>} />
            <Route path="/patients" element={<ProtectedRoute><LazyRoute><Patients /></LazyRoute></ProtectedRoute>} />
            <Route path="/post-announcement" element={<ProtectedRoute><LazyRoute><PostAnnouncement /></LazyRoute></ProtectedRoute>} />
            <Route path="/upload-prescription" element={<ProtectedRoute><LazyRoute><UploadPrescription /></LazyRoute></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><LazyRoute><Profile /></LazyRoute></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
