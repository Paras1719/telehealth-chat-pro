import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { 
  Heart, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Users, 
  Settings,
  Menu,
  X,
  LogOut,
  User
} from "lucide-react";

interface NavigationProps {
  userType: 'patient' | 'doctor';
  onUserTypeChange: (type: 'patient' | 'doctor') => void;
}

export function Navigation({ userType, onUserTypeChange }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  const patientNavItems = [
    { icon: User, label: "My Profile", id: "profile" },
    { icon: Calendar, label: "Book Appointment", id: "appointments" },
    { icon: Users, label: "Find Doctors", id: "doctors" },
    { icon: MessageSquare, label: "Announcements", id: "announcements" },
    { icon: FileText, label: "Prescriptions", id: "prescriptions" }
  ];

  const doctorNavItems = [
    { icon: User, label: "My Profile", id: "profile" },
    { icon: Calendar, label: "My Schedule", id: "schedule" },
    { icon: MessageSquare, label: "Post Announcement", id: "post" },
    { icon: FileText, label: "Upload Prescription", id: "upload" },
    { icon: Users, label: "My Patients", id: "patients" }
  ];

  const currentNavItems = userType === 'patient' ? patientNavItems : doctorNavItems;

  const getRouteForNavItem = (itemId: string) => {
    const routeMap: { [key: string]: string } = {
      profile: '/profile',
      appointments: '/appointments',
      doctors: '/doctors', 
      announcements: '/announcements',
      prescriptions: '/prescriptions',
      schedule: '/schedule',
      post: '/post-announcement',
      upload: '/upload-prescription',
      patients: '/patients'
    };
    return routeMap[itemId] || '/';
  };

  return (
    <nav className="bg-white shadow-card-custom border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-medical rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">HealthCare Pro</h1>
              <p className="text-xs text-muted-foreground">Professional Healthcare Platform</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={getRouteForNavItem(item.id)}
                  className="flex items-center space-x-2 text-foreground hover:text-medical transition-colors duration-200 px-3 py-2 rounded-md hover:bg-medical-light/50"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Type Toggle & Mobile Menu */}
          <div className="flex items-center space-x-3">
            {user && profile ? (
              <>
                <span className="hidden sm:block text-sm text-muted-foreground">
                  Welcome, {profile.full_name}
                </span>
                <div className="hidden sm:flex items-center bg-secondary rounded-lg p-1">
                  <Button
                    variant={userType === 'patient' ? 'medical' : 'ghost'}
                    size="sm"
                    onClick={() => onUserTypeChange('patient')}
                    className="text-xs px-3"
                  >
                    Patient
                  </Button>
                  <Button
                    variant={userType === 'doctor' ? 'medical' : 'ghost'}
                    size="sm"
                    onClick={() => onUserTypeChange('doctor')}
                    className="text-xs px-3"
                  >
                    Doctor
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="hidden sm:flex items-center text-xs"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="medical" size="sm" className="text-xs">
                  <User className="w-4 h-4 mr-1" />
                  Sign In
                </Button>
              </Link>
            )}
            
            <button
              className="md:hidden p-2 rounded-md text-foreground hover:bg-medical-light/50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {user && profile ? (
                <>
                  <div className="text-sm text-muted-foreground px-3 py-2">
                    Welcome, {profile.full_name}
                  </div>
                  <div className="flex sm:hidden justify-center mb-3">
                    <div className="flex items-center bg-secondary rounded-lg p-1 w-full max-w-xs">
                      <Button
                        variant={userType === 'patient' ? 'medical' : 'ghost'}
                        size="sm"
                        onClick={() => onUserTypeChange('patient')}
                        className="text-xs flex-1"
                      >
                        Patient
                      </Button>
                      <Button
                        variant={userType === 'doctor' ? 'medical' : 'ghost'}
                        size="sm"
                        onClick={() => onUserTypeChange('doctor')}
                        className="text-xs flex-1"
                      >
                        Doctor
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={signOut}
                    className="w-full text-left justify-start"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link to="/auth" className="block px-3">
                  <Button variant="medical" size="sm" className="w-full">
                    <User className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              )}
              
              {user && currentNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    to={getRouteForNavItem(item.id)}
                    className="flex items-center space-x-3 w-full text-left px-3 py-2 rounded-md text-foreground hover:text-medical hover:bg-medical-light/50 transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}