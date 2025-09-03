import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User, Phone, MessageSquare, Star, Search, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { BookAppointmentDialog } from "@/components/BookAppointmentDialog";

interface Doctor {
  id: string;
  user_id: string;
  full_name: string;
  specialization?: string;
  bio?: string;
  experience_years?: number;
  consultation_fee?: number;
  phone?: string;
  avatar_url?: string;
  qualifications?: string;
}

const Doctors = () => {
  const { user, profile } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userType, setUserType] = useState<'patient' | 'doctor'>('patient');

  useEffect(() => {
    if (profile?.role) {
      setUserType(profile.role);
    }
  }, [profile?.role]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = doctors.filter(doctor =>
        doctor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.bio?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors(doctors);
    }
  }, [searchTerm, doctors]);

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'doctor')
        .order('full_name', { ascending: true });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch doctors",
          variant: "destructive",
        });
        return;
      }

      setDoctors(data || []);
      setFilteredDoctors(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppSupport = (doctor: Doctor) => {
    const message = encodeURIComponent(`Hi, I need help regarding Dr. ${doctor.full_name}${doctor.specialization ? ` (${doctor.specialization})` : ''}. Please assist me.`);
    window.open(`https://wa.me/1234567890?text=${message}`, '_blank');
  };

  const handleCallDoctor = (phone?: string) => {
    if (phone) {
      window.open(`tel:${phone}`);
    } else {
      toast({
        title: "Phone not available",
        description: "This doctor's phone number is not available. Please use WhatsApp booking.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation userType={userType} onUserTypeChange={setUserType} />
        <div className="flex items-center justify-center pt-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation userType={userType} onUserTypeChange={setUserType} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Find Doctors</h1>
          <p className="text-muted-foreground">
            Browse our network of qualified healthcare professionals
          </p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by name, specialization, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredDoctors.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {searchTerm ? 'No doctors found' : 'No doctors available'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Please check back later for available doctors'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-medical-light rounded-full flex items-center justify-center">
                      {doctor.avatar_url ? (
                        <img 
                          src={doctor.avatar_url} 
                          alt={doctor.full_name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-medical" />
                      )}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">Dr. {doctor.full_name}</CardTitle>
                      {doctor.specialization && (
                        <Badge variant="secondary" className="mt-1">
                          {doctor.specialization}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {doctor.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {doctor.bio}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      {doctor.experience_years && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          {doctor.experience_years} years exp.
                        </div>
                      )}
                      {doctor.consultation_fee && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">${doctor.consultation_fee}</span>
                          consultation fee
                        </div>
                      )}
                    </div>

                    {doctor.qualifications && (
                      <div>
                        <h4 className="font-medium text-sm text-foreground mb-1">Qualifications:</h4>
                        <p className="text-sm text-muted-foreground">{doctor.qualifications}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4">
                      <BookAppointmentDialog 
                        doctor={doctor}
                        trigger={
                          <Button className="flex-1 bg-medical hover:bg-medical-secondary">
                            <Calendar className="w-4 h-4 mr-2" />
                            Book Appointment
                          </Button>
                        }
                      />
                      {doctor.phone && (
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleCallDoctor(doctor.phone)}
                        >
                          <Phone className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleWhatsAppSupport(doctor)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      WhatsApp Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Doctors;