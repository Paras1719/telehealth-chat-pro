import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Plus, Edit, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AddTimeSlotDialog } from "@/components/AddTimeSlotDialog";
import { EditTimeSlotDialog } from "@/components/EditTimeSlotDialog";

interface TimeSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'available' | 'booked' | 'blocked';
  notes?: string;
  // Data from joined appointments table
  patient_name?: string;
  patient_phone?: string;
  appointment_notes?: string;
}


const Schedule = () => {
  const { user, profile } = useAuth();
  const [schedule, setSchedule] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'patient' | 'doctor'>('doctor');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);

  useEffect(() => {
    if (profile?.role) {
      setUserType(profile.role);
    }
  }, [profile?.role]);

  const fetchSchedule = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get doctor schedules
      const { data, error } = await supabase
        .from('doctor_schedules')
        .select('*')
        .eq('doctor_id', user.id)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;

      // Get appointments for these schedules to determine booking status
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          doctor_id,
          appointment_date,
          notes,
          profiles!appointments_patient_id_fkey(
            full_name,
            phone
          )
        `)
        .eq('doctor_id', user.id);

      if (appointmentsError) throw appointmentsError;

      // Transform the data to match our TimeSlot interface
      const transformedSchedule: TimeSlot[] = data?.map(slot => {
        const slotDate = new Date(slot.date).toISOString().split('T')[0];
        const slotStart = slot.start_time;
        const slotEnd = slot.end_time;
        
        // Check if this slot has an appointment
        const appointment = appointments?.find(apt => {
          const aptDate = new Date(apt.appointment_date).toISOString().split('T')[0];
          const aptStart = new Date(apt.appointment_date).toTimeString().slice(0, 5);
          return aptDate === slotDate && 
                 aptStart >= slotStart && 
                 aptStart < slotEnd;
        });

        return {
          id: slot.id,
          date: slot.date,
          start_time: slot.start_time,
          end_time: slot.end_time,
          status: appointment ? 'booked' as const : slot.status as 'available' | 'blocked',
          notes: slot.notes,
          patient_name: appointment?.profiles?.full_name,
          patient_phone: appointment?.profiles?.phone,
          appointment_notes: appointment?.notes
        };
      }) || [];

      setSchedule(transformedSchedule);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load schedule",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSchedule();
    }
  }, [user]);

  const filteredSchedule = schedule.filter(slot => slot.date === selectedDate);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-medical-light text-medical-secondary';
      case 'booked': return 'bg-accent/20 text-accent-foreground';
      case 'blocked': return 'bg-destructive/20 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleContactPatient = (phone: string, patientName: string) => {
    const message = encodeURIComponent(`Hi ${patientName}, this is Dr. ${profile?.full_name}. Regarding your upcoming appointment.`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleAddSlot = () => {
    setShowAddDialog(true);
  };

  const handleEditSlot = (slotId: string) => {
    const slot = schedule.find(s => s.id === slotId);
    if (slot) {
      setEditingSlot(slot);
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
            <h1 className="text-3xl font-bold text-foreground">My Schedule</h1>
            <p className="text-muted-foreground mt-2">
              Manage your appointments and availability
            </p>
          </div>
          
          <Button onClick={handleAddSlot} className="bg-medical hover:bg-medical-secondary">
            <Plus className="w-4 h-4 mr-2" />
            Add Time Slot
          </Button>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-4">
            <label htmlFor="date-select" className="text-sm font-medium text-foreground">
              Select Date:
            </label>
            <input
              id="date-select"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-medical"
            />
          </div>
        </div>

        {filteredSchedule.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No appointments scheduled
              </h3>
              <p className="text-muted-foreground mb-4">
                No time slots found for {new Date(selectedDate).toLocaleDateString()}
              </p>
              <Button onClick={handleAddSlot} className="bg-medical hover:bg-medical-secondary">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Time Slot
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredSchedule
              .sort((a, b) => a.start_time.localeCompare(b.start_time))
              .map((slot) => (
                <Card key={slot.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-medical" />
                          {slot.start_time} - {slot.end_time}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {new Date(slot.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(slot.status)}>
                          {slot.status.toUpperCase()}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSlot(slot.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {slot.status === 'booked' && (
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="w-5 h-5 text-medical" />
                            <div>
                              <span className="font-medium text-foreground">{slot.patient_name}</span>
                              {slot.patient_phone && (
                                <p className="text-sm text-muted-foreground">{slot.patient_phone}</p>
                              )}
                            </div>
                          </div>
                          
                          {slot.patient_phone && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleContactPatient(slot.patient_phone!, slot.patient_name!)}
                            >
                              <MessageSquare className="w-4 h-4 mr-1" />
                              WhatsApp
                            </Button>
                          )}
                        </div>
                        
                         {(slot.appointment_notes || slot.notes) && (
                          <div>
                            <h4 className="font-medium text-sm text-foreground mb-1">Notes:</h4>
                            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                              {slot.appointment_notes || slot.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                  
                  {slot.status === 'available' && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        This time slot is available for booking by patients.
                      </p>
                    </CardContent>
                  )}
                  
                  {slot.status === 'blocked' && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        This time slot is blocked and not available for booking.
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-medical-light rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-medical" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available Slots</p>
                  <p className="text-2xl font-bold text-foreground">
                    {filteredSchedule.filter(s => s.status === 'available').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Booked Appointments</p>
                  <p className="text-2xl font-bold text-foreground">
                    {filteredSchedule.filter(s => s.status === 'booked').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-destructive/20 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Blocked Slots</p>
                  <p className="text-2xl font-bold text-foreground">
                    {filteredSchedule.filter(s => s.status === 'blocked').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dialogs */}
        <AddTimeSlotDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onSuccess={fetchSchedule}
          selectedDate={selectedDate}
        />
        
        <EditTimeSlotDialog
          slot={editingSlot}
          open={!!editingSlot}
          onOpenChange={(open) => !open && setEditingSlot(null)}
          onSuccess={fetchSchedule}
        />
      </div>
    </div>
  );
};

export default Schedule;