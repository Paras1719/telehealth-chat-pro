import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, User, Calendar, MessageSquare, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

// Mock prescription data - in a real app, this would come from Supabase
interface Prescription {
  id: string;
  patient_name: string;
  doctor_name: string;
  doctor_specialization?: string;
  date_prescribed: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }[];
  diagnosis?: string;
  notes?: string;
  status: 'active' | 'completed' | 'cancelled';
}

const mockPrescriptions: Prescription[] = [
  {
    id: '1',
    patient_name: 'John Doe',
    doctor_name: 'Dr. Sarah Wilson',
    doctor_specialization: 'Cardiologist', 
    date_prescribed: '2024-01-15',
    diagnosis: 'Hypertension',
    medications: [
      {
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        duration: '30 days',
        instructions: 'Take with food'
      },
      {
        name: 'Amlodipine',
        dosage: '5mg',
        frequency: 'Once daily', 
        duration: '30 days',
        instructions: 'Take in the morning'
      }
    ],
    notes: 'Follow up in 2 weeks to check blood pressure',
    status: 'active'
  },
  {
    id: '2',
    patient_name: 'Jane Smith',
    doctor_name: 'Dr. Michael Chen',
    doctor_specialization: 'General Practitioner',
    date_prescribed: '2024-01-10',
    diagnosis: 'Upper Respiratory Infection',
    medications: [
      {
        name: 'Amoxicillin',
        dosage: '500mg',
        frequency: 'Three times daily',
        duration: '7 days',
        instructions: 'Take with meals'
      }
    ],
    notes: 'Complete the full course even if symptoms improve',
    status: 'completed'
  }
];

const Prescriptions = () => {
  const { user, profile } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'patient' | 'doctor'>('patient');

  useEffect(() => {
    if (profile?.role) {
      setUserType(profile.role);
    }
  }, [profile?.role]);

  useEffect(() => {
    // Simulate loading prescriptions
    setTimeout(() => {
      setPrescriptions(mockPrescriptions);
      setLoading(false);
    }, 1000);
  }, []);

  const handleDownloadPrescription = (prescriptionId: string) => {
    // In a real app, this would generate and download a PDF
    toast({
      title: "Download Started",
      description: "Prescription PDF is being generated...",
    });
  };

  const handleWhatsAppSupport = () => {
    const message = encodeURIComponent("Hi, I need help with my prescription. Please assist me.");
    window.open(`https://wa.me/1234567890?text=${message}`, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {userType === 'patient' ? 'My Prescriptions' : 'Patient Prescriptions'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {userType === 'patient' 
                ? 'View and download your medical prescriptions'
                : 'Manage patient prescriptions and create new ones'
              }
            </p>
          </div>
          
          {userType === 'doctor' && (
            <Link to="/upload-prescription">
              <Button className="bg-medical hover:bg-medical-secondary">
                <FileText className="w-4 h-4 mr-2" />
                Upload Prescription
              </Button>
            </Link>
          )}
        </div>

        {prescriptions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No prescriptions found
              </h3>
              <p className="text-muted-foreground mb-4">
                {userType === 'patient' 
                  ? "You don't have any prescriptions yet."
                  : "No patient prescriptions found."
                }
              </p>
              <Button onClick={handleWhatsAppSupport} variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {prescriptions.map((prescription) => (
              <Card key={prescription.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-medical" />
                        Prescription #{prescription.id}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(prescription.date_prescribed).toLocaleDateString()}
                        </div>
                        {userType === 'patient' && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {prescription.doctor_name}
                            {prescription.doctor_specialization && (
                              <span className="text-xs">- {prescription.doctor_specialization}</span>
                            )}
                          </div>
                        )}
                        {userType === 'doctor' && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {prescription.patient_name}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge className={getStatusColor(prescription.status)}>
                      {prescription.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {prescription.diagnosis && (
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Diagnosis:</h4>
                        <p className="text-muted-foreground">{prescription.diagnosis}</p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium text-foreground mb-3">Medications:</h4>
                      <div className="space-y-3">
                        {prescription.medications.map((medication, index) => (
                          <div key={index} className="border border-border rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                              <div>
                                <span className="font-medium text-foreground">{medication.name}</span>
                                <p className="text-sm text-muted-foreground">{medication.dosage}</p>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-foreground">Frequency</span>
                                <p className="text-sm text-muted-foreground">{medication.frequency}</p>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-foreground">Duration</span>
                                <p className="text-sm text-muted-foreground">{medication.duration}</p>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-foreground">Instructions</span>
                                <p className="text-sm text-muted-foreground">
                                  {medication.instructions || 'As directed'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {prescription.notes && (
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Doctor's Notes:</h4>
                        <div className="bg-medical-light/20 border border-medical/20 rounded-lg p-3">
                          <p className="text-sm text-muted-foreground">{prescription.notes}</p>
                        </div>
                      </div>
                    )}

                    {prescription.status === 'active' && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-amber-800">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="font-medium text-sm">Important Reminder</span>
                        </div>
                        <p className="text-sm text-amber-700 mt-1">
                          Please complete the full course of medication as prescribed. Contact your doctor if you experience any side effects.
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4 border-t border-border">
                      <Button 
                        variant="outline"
                        onClick={() => handleDownloadPrescription(prescription.id)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={handleWhatsAppSupport}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Ask Doctor
                      </Button>
                    </div>
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

export default Prescriptions;