import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  FileText,
  Heart,
  Shield,
  Clock,
  Phone,
  UserCheck
} from "lucide-react";
import heroImage from "@/assets/hero-medical.jpg";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface HeroProps {
  userType: 'patient' | 'doctor';
}

export function Hero({ userType }: HeroProps) {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const handleWhatsAppBooking = () => {
    const message = encodeURIComponent("Hi, I would like to book an appointment. Please help me with available slots.");
    window.location.href = `https://wa.me/1234567890?text=${message}`;
  };

  const handleWhatsAppSupport = () => {
    const message = encodeURIComponent("Hi, I need support with Health_P healthcare platform.");
    window.location.href = `https://wa.me/1234567890?text=${message}`;
  };

  const handleServiceAction = (service: any, index: number) => {
    const routeMap: { [key: string]: string } = {
      'Book an Appointment': '/appointments',
      'Find Specialists': '/doctors',
      'Health Updates': '/announcements', 
      'Prescription Access': '/prescriptions',
      'Manage Schedule': '/schedule',
      'Post Updates': '/post-announcement',
      'Upload Prescriptions': '/upload-prescription',
      'Patient Management': '/patients'
    };

    const route = routeMap[service.title];
    if (route) {
      navigate(route);
    } else {
      // Fallback to WhatsApp for booking
      handleWhatsAppBooking();
    }
  };

  const patientServices = [
    {
      icon: Calendar,
      title: "Book an Appointment",
      description: "Schedule with our expert doctors",
      action: "Book Now"
    },
    {
      icon: Users,
      title: "Find Specialists",
      description: "Browse our network of healthcare professionals",
      action: "Browse"
    },
    {
      icon: MessageSquare,
      title: "Health Updates",
      description: "Get latest health tips and announcements",
      action: "View"
    },
    {
      icon: FileText,
      title: "Prescription Access",
      description: "Download and manage your prescriptions",
      action: "Access"
    }
  ];

  const doctorFeatures = [
    {
      icon: Calendar,
      title: "Manage Schedule",
      description: "Update your availability and appointments",
      action: "Manage"
    },
    {
      icon: MessageSquare,
      title: "Post Updates",
      description: "Share health tips and announcements",
      action: "Post"
    },
    {
      icon: FileText,
      title: "Upload Prescriptions",
      description: "Digitally manage patient prescriptions",
      action: "Upload"
    },
    {
      icon: Users,
      title: "Patient Management",
      description: "Access patient records and history",
      action: "View"
    }
  ];

  const currentServices = userType === 'patient' ? patientServices : doctorFeatures;

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative bg-gradient-hero text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-medical/90 to-medical-secondary/90"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            {user && profile ? (
              <div className="mb-6">
                <div className="flex items-center justify-center lg:justify-start mb-4">
                  <UserCheck className="w-8 h-8 text-medical-accent mr-3" />
                  <span className="text-medical-accent font-semibold text-lg">Welcome back!</span>
                </div>
                <h1 className="text-3xl lg:text-5xl font-bold mb-4 leading-tight">
                  Hello, {profile.full_name}
                  <span className="block text-medical-accent text-2xl lg:text-3xl mt-2">
                    {profile.role === 'doctor' ? 'Ready to help patients today?' : 'Your health journey continues'}
                  </span>
                </h1>
                <p className="text-lg lg:text-xl mb-8 text-white/90">
                  {profile.role === 'doctor' 
                    ? "Manage your schedule, connect with patients, and provide exceptional care."
                    : "Access your appointments, prescriptions, and stay connected with your healthcare team."
                  }
                </p>
              </div>
            ) : (
              <>
                <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                  Healthcare for Good
                  <span className="block text-medical-accent">Today. Tomorrow. Always</span>
                </h1>
                <p className="text-xl lg:text-2xl mb-8 text-white/90">
                  {userType === 'patient' 
                    ? "Access quality healthcare services, book appointments, and stay connected with your doctors."
                    : "Manage your practice efficiently, connect with patients, and provide exceptional healthcare services."
                  }
                </p>
              </>
            )}
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {user && profile ? (
                  <>
                    <Button 
                      size="lg" 
                      className="bg-white text-medical hover:bg-white/90 shadow-lg text-lg px-8 py-6"
                      onClick={() => navigate('/profile')}
                    >
                      <UserCheck className="w-5 h-5 mr-2" />
                      Complete Profile
                    </Button>
                    <Button 
                      size="lg" 
                      className="bg-medical-accent text-white hover:bg-medical-accent/90 shadow-lg text-lg px-8 py-6"
                      onClick={() => navigate(userType === 'patient' ? '/appointments' : '/schedule')}
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      {userType === 'patient' ? 'My Appointments' : 'My Schedule'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      size="lg" 
                      className="bg-white text-medical hover:bg-white/90 shadow-lg text-lg px-8 py-6"
                      onClick={() => navigate('/auth')}
                    >
                      <UserCheck className="w-5 h-5 mr-2" />
                      Get Started
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="border-white text-white hover:bg-white hover:text-medical text-lg px-8 py-6"
                      onClick={handleWhatsAppSupport}
                    >
                      <Phone className="w-5 h-5 mr-2" />
                      WhatsApp Support
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <Heart className="w-8 h-8 text-medical-accent mb-2" />
                    <h3 className="font-semibold">24/7 Care</h3>
                    <p className="text-sm text-white/80">Round the clock healthcare support</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <Shield className="w-8 h-8 text-medical-accent mb-2" />
                    <h3 className="font-semibold">Secure Platform</h3>
                    <p className="text-sm text-white/80">Your data is protected</p>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <Clock className="w-8 h-8 text-medical-accent mb-2" />
                    <h3 className="font-semibold">Quick Access</h3>
                    <p className="text-sm text-white/80">Fast appointment booking</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <Users className="w-8 h-8 text-medical-accent mb-2" />
                    <h3 className="font-semibold">Expert Doctors</h3>
                    <p className="text-sm text-white/80">Qualified healthcare professionals</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {userType === 'patient' ? 'How We Can Help You' : 'Doctor Dashboard Features'}
            </h2>
            <p className="text-lg text-muted-foreground">
              {userType === 'patient' 
                ? 'Comprehensive healthcare services at your fingertips'
                : 'Powerful tools to manage your practice effectively'
              }
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="p-6 hover:shadow-medical transition-all duration-300 cursor-pointer group border hover:border-medical/30">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-medical-light rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-medical transition-colors duration-300">
                      <Icon className="w-8 h-8 text-medical group-hover:text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">{service.title}</h3>
                    <p className="text-muted-foreground mb-4">{service.description}</p>
                    <Button 
                      variant="outline" 
                      className="w-full border-medical text-medical hover:bg-medical hover:text-white"
                      onClick={() => handleServiceAction(service, index)}
                    >
                      {service.action}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* WhatsApp Contact Section */}
      <section className="py-16 bg-medical-light/20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-card-custom p-8 border border-border">
            <Phone className="w-16 h-16 text-medical mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Need Immediate Assistance?
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Connect with us instantly via WhatsApp for appointments, queries, or emergency support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={handleWhatsAppBooking}
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                WhatsApp Chat
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-medical text-medical hover:bg-medical hover:text-white"
                onClick={() => window.open('tel:+1234567890')}
              >
                <Phone className="w-5 h-5 mr-2" />
                Call Now
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}