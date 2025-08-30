import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";

const Index = () => {
  const [userType, setUserType] = useState<'patient' | 'doctor'>('patient');

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
    </div>
  );
};

export default Index;