import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";

const Index = () => {
  const { user, profile } = useAuth();
  const [userType, setUserType] = useState<'patient' | 'doctor'>('patient');

  // Update userType based on profile role when user logs in
  useEffect(() => {
    if (profile?.role) {
      setUserType(profile.role);
    }
  }, [profile?.role]);

  const handleUserTypeChange = (type: 'patient' | 'doctor') => {
    setUserType(type);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        userType={userType} 
        onUserTypeChange={handleUserTypeChange} 
      />
      <Hero userType={userType} />
      
      {!user && (
        <section className="py-16 bg-medical-light/10 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Join thousands of patients and doctors already using our platform
            </p>
          </div>
        </section>
      )}
    </div>
  );
};

export default Index;