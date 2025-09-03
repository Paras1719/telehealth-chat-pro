import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User, Phone, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Appointment {
  id: string;
  appointment_date: string;
  duration_minutes: number;
  status: string;
  notes?: string;
  patient_notes?: string;
  doctor_notes?: string;
  doctor?: {
    full_name: string;
    specialization?: string;
    phone?: string;
  } | null;
  patient?: {
    full_name: string;
    phone?: string;
  } | null;
}

const Appointments = () => {
  const { user, profile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'patient' | 'doctor'>('patient');

  useEffect(() => {
    if (profile?.role) {
      setUserType(profile.role);
    }
  }, [profile?.role]);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          doctor:doctor_id(full_name, specialization, phone),
          patient:patient_id(full_name, phone)
        `);

      // Filter based on user role
      if (userType === 'patient') {
        query = query.eq('patient_id', user?.id);
      } else if (userType === 'doctor') {
        query = query.eq('doctor_id', user?.id);
      }

      const { data, error } = await query.order('appointment_date', { ascending: true });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch appointments",
          variant: "destructive",
        });
        return;
      }

      setAppointments((data || []) as unknown as Appointment[]);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppBooking = () => {
    const message = encodeURIComponent("Hi, I would like to book an appointment. Please help me with available slots.");
    window.open(`https://wa.me/1234567890?text=${message}`, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-gray-100 text-gray-800';
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
              {userType === 'patient' ? 'My Appointments' : 'Patient Appointments'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {userType === 'patient' 
                ? 'View and manage your upcoming appointments'
                : 'Manage your patient appointments'
              }
            </p>
          </div>
          
          {userType === 'patient' && (
            <Button onClick={handleWhatsAppBooking} className="bg-medical hover:bg-medical-secondary">
              <MessageSquare className="w-4 h-4 mr-2" />
              Book New Appointment
            </Button>
          )}
        </div>

        {appointments.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No appointments found
              </h3>
              <p className="text-muted-foreground mb-4">
                {userType === 'patient' 
                  ? "You don't have any appointments scheduled yet."
                  : "No patient appointments found."
                }
              </p>
              {userType === 'patient' && (
                <Button onClick={handleWhatsAppBooking} className="bg-medical hover:bg-medical-secondary">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Book Your First Appointment
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {appointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-medical" />
                        {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(appointment.appointment_date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <span>Duration: {appointment.duration_minutes} minutes</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userType === 'patient' && appointment.doctor && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-medical" />
                        <div>
                          <span className="font-medium">Dr. {appointment.doctor.full_name}</span>
                          {appointment.doctor.specialization && (
                            <span className="text-muted-foreground ml-2">
                              - {appointment.doctor.specialization}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {userType === 'doctor' && appointment.patient && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-medical" />
                        <span className="font-medium">{appointment.patient.full_name}</span>
                      </div>
                    )}

                    {appointment.notes && (
                      <div>
                        <h4 className="font-medium text-sm text-foreground mb-1">Notes:</h4>
                        <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                      </div>
                    )}

                    {appointment.patient_notes && userType === 'doctor' && (
                      <div>
                        <h4 className="font-medium text-sm text-foreground mb-1">Patient Notes:</h4>
                        <p className="text-sm text-muted-foreground">{appointment.patient_notes}</p>
                      </div>
                    )}

                    {appointment.doctor_notes && userType === 'patient' && (
                      <div>
                        <h4 className="font-medium text-sm text-foreground mb-1">Doctor Notes:</h4>
                        <p className="text-sm text-muted-foreground">{appointment.doctor_notes}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(`https://wa.me/1234567890?text=${encodeURIComponent(`Regarding appointment on ${new Date(appointment.appointment_date).toLocaleDateString()}`)}`, '_blank')}
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        WhatsApp
                      </Button>
                      {appointment.status === 'scheduled' && (
                        <Button variant="outline" size="sm">
                          Reschedule
                        </Button>
                      )}
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

export default Appointments;