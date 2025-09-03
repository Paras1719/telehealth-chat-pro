import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MessageSquare, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AppointmentCard } from "@/components/AppointmentCard";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
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

  const handleBookNewAppointment = () => {
    navigate('/doctors');
  };

  const handleContactPerson = (phone: string, name: string) => {
    const message = encodeURIComponent(`Hi ${name}, this is regarding our appointment. Please let me know if you have any questions.`);
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const handleRescheduleAppointment = (appointmentId: string) => {
    // TODO: Implement reschedule functionality
    toast({
      title: "Feature Coming Soon",
      description: "Reschedule functionality will be available soon. Please contact support for now.",
    });
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to cancel appointment",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Appointment cancelled successfully",
      });

      // Refresh appointments
      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
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
            <Button onClick={handleBookNewAppointment} className="bg-medical hover:bg-medical-secondary">
              <Search className="w-4 h-4 mr-2" />
              Find Doctors
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
                <Button onClick={handleBookNewAppointment} className="bg-medical hover:bg-medical-secondary">
                  <Search className="w-4 h-4 mr-2" />
                  Find Doctors
                </Button>
               )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {appointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onReschedule={handleRescheduleAppointment}
                onCancel={handleCancelAppointment}
                onContact={handleContactPerson}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;