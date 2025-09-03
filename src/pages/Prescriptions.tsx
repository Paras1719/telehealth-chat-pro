import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, User, Calendar, MessageSquare, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Prescription {
  id: string;
  patient_name: string;
  patient_phone?: string;
  diagnosis: string;
  medications: any; // JSONB from Supabase
  notes?: string;
  created_at: string;
  doctor?: {
    full_name: string;
    specialization?: string;
  } | null;
}

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
    if (user) {
      fetchPrescriptions();
    }
  }, [user, userType]);

  const fetchPrescriptions = async () => {
    try {
      let query = supabase.from('prescriptions').select(`
        *,
        doctor:doctor_id(full_name, specialization)
      `);

      // Filter based on user role
      if (userType === 'patient') {
        query = query.or(`patient_id.eq.${user?.id},patient_name.eq.${profile?.full_name}`);
      } else {
        query = query.eq('doctor_id', user?.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch prescriptions",
          variant: "destructive",
        });
        return;
      }

      setPrescriptions((data || []) as unknown as Prescription[]);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const isRecentPrescription = (dateString: string) => {
    const prescriptionDate = new Date(dateString);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return prescriptionDate > thirtyDaysAgo;
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
                          {new Date(prescription.created_at).toLocaleDateString()}
                        </div>
                        {userType === 'patient' && prescription.doctor && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            Dr. {prescription.doctor.full_name}
                            {prescription.doctor.specialization && (
                              <span className="text-xs">- {prescription.doctor.specialization}</span>
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
                    <Badge className={isRecentPrescription(prescription.created_at) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {isRecentPrescription(prescription.created_at) ? 'ACTIVE' : 'OLDER'}
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

                     {isRecentPrescription(prescription.created_at) && (
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