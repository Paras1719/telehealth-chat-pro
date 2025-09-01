import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User, Phone, MessageSquare, Calendar, FileText, Search, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

// Mock patient data - in a real app, this would come from Supabase
interface Patient {
  id: string;
  full_name: string;
  phone?: string;
  email?: string;
  date_of_birth?: string;
  gender?: string;
  emergency_contact?: string;
  last_appointment?: string;
  upcoming_appointments: number;
  total_appointments: number;
  medical_notes?: string;
}

const mockPatients: Patient[] = [
  {
    id: '1',
    full_name: 'John Doe',
    phone: '+1234567890',
    email: 'john.doe@email.com',
    date_of_birth: '1985-03-15',
    gender: 'Male',
    emergency_contact: '+1234567891',
    last_appointment: '2024-01-10',
    upcoming_appointments: 1,
    total_appointments: 5,
    medical_notes: 'Hypertension, regular follow-ups needed'
  },
  {
    id: '2',
    full_name: 'Jane Smith',
    phone: '+1234567892',
    email: 'jane.smith@email.com',
    date_of_birth: '1990-07-22',
    gender: 'Female',
    emergency_contact: '+1234567893',
    last_appointment: '2024-01-05',
    upcoming_appointments: 0,
    total_appointments: 3,
    medical_notes: 'No significant medical history'
  },
  {
    id: '3',
    full_name: 'Robert Johnson',
    phone: '+1234567894',
    email: 'robert.j@email.com',
    date_of_birth: '1978-11-30',
    gender: 'Male',
    last_appointment: '2023-12-20',
    upcoming_appointments: 2,
    total_appointments: 8,
    medical_notes: 'Diabetes Type 2, requires regular monitoring'
  }
];

const Patients = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userType, setUserType] = useState<'patient' | 'doctor'>('doctor');

  useEffect(() => {
    if (profile?.role) {
      setUserType(profile.role);
      // Redirect if not a doctor
      if (profile.role !== 'doctor') {
        navigate('/');
        toast({
          title: "Access Denied",
          description: "Only doctors can access patient management.",
          variant: "destructive",
        });
      }
    }
  }, [profile?.role, navigate]);

  useEffect(() => {
    // Simulate loading patients
    setTimeout(() => {
      setPatients(mockPatients);
      setFilteredPatients(mockPatients);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = patients.filter(patient =>
        patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.includes(searchTerm) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [searchTerm, patients]);

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleContactPatient = (phone: string, patientName: string) => {
    const message = encodeURIComponent(`Hi ${patientName}, this is Dr. ${profile?.full_name}. I wanted to follow up regarding your healthcare.`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleCallPatient = (phone: string) => {
    window.open(`tel:${phone}`);
  };

  const handleEmailPatient = (email: string) => {
    window.open(`mailto:${email}`);
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
          <h1 className="text-3xl font-bold text-foreground">My Patients</h1>
          <p className="text-muted-foreground mt-2">
            Manage your patient records and appointments
          </p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Patients</p>
                  <p className="text-2xl font-bold text-foreground">{patients.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming Appointments</p>
                  <p className="text-2xl font-bold text-foreground">
                    {patients.reduce((sum, p) => sum + p.upcoming_appointments, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Appointments</p>
                  <p className="text-2xl font-bold text-foreground">
                    {patients.reduce((sum, p) => sum + p.total_appointments, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Patients</p>
                  <p className="text-2xl font-bold text-foreground">
                    {patients.filter(p => p.upcoming_appointments > 0 || 
                      (p.last_appointment && new Date(p.last_appointment) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
                    ).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {filteredPatients.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {searchTerm ? 'No patients found' : 'No patients yet'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Patients will appear here as they book appointments with you'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredPatients.map((patient) => (
              <Card key={patient.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-medical-light rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-medical" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{patient.full_name}</CardTitle>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          {patient.date_of_birth && (
                            <span>Age: {calculateAge(patient.date_of_birth)}</span>
                          )}
                          {patient.gender && (
                            <span>Gender: {patient.gender}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {patient.upcoming_appointments > 0 && (
                        <Badge className="bg-green-100 text-green-800">
                          {patient.upcoming_appointments} upcoming
                        </Badge>
                      )}
                      <Badge variant="secondary">
                        {patient.total_appointments} total visits
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground">Contact Information</h4>
                      
                      {patient.phone && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-medical" />
                            <span className="text-sm">{patient.phone}</span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCallPatient(patient.phone!)}
                            >
                              <Phone className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleContactPatient(patient.phone!, patient.full_name)}
                            >
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {patient.email && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-medical" />
                            <span className="text-sm">{patient.email}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEmailPatient(patient.email!)}
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      
                      {patient.emergency_contact && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-red-500" />
                          <span className="text-sm">Emergency: {patient.emergency_contact}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground">Medical Summary</h4>
                      
                      {patient.last_appointment && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-medical" />
                          <span className="text-sm">
                            Last visit: {new Date(patient.last_appointment).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      
                      {patient.medical_notes && (
                        <div>
                          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                            {patient.medical_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 mt-4 border-t border-border">
                    <Button variant="outline" size="sm">
                      <Calendar className="w-4 h-4 mr-1" />
                      View Appointments
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-1" />
                      Medical Records
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => patient.phone && handleContactPatient(patient.phone, patient.full_name)}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Contact
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

export default Patients;