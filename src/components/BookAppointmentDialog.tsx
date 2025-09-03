import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Doctor {
  user_id: string;
  full_name: string;
  specialization?: string;
  consultation_fee?: number;
  phone?: string;
}

interface TimeSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  max_appointments: number;
}

interface BookAppointmentDialogProps {
  doctor: Doctor;
  trigger: React.ReactNode;
}

export function BookAppointmentDialog({ doctor, trigger }: BookAppointmentDialogProps) {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    if (open && doctor) {
      fetchAvailableTimeSlots();
    }
  }, [open, doctor]);

  const fetchAvailableTimeSlots = async () => {
    setSlotsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('doctor_schedules')
        .select('*')
        .eq('doctor_id', doctor.user_id)
        .eq('status', 'available')
        .gte('date', today)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(20);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch available time slots",
          variant: "destructive",
        });
        return;
      }

      setTimeSlots(data || []);
    } catch (error) {
      console.error('Error fetching time slots:', error);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedSlot || !user || profile?.role !== 'patient') {
      toast({
        title: "Error",
        description: "Please select a time slot and ensure you're logged in as a patient",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create appointment
      const appointmentDateTime = new Date(`${selectedSlot.date}T${selectedSlot.start_time}`);
      
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          doctor_id: doctor.user_id,
          patient_id: user.id,
          appointment_date: appointmentDateTime.toISOString(),
          duration_minutes: 30,
          status: 'scheduled',
          patient_notes: notes.trim() || null
        });

      if (appointmentError) {
        toast({
          title: "Error",
          description: "Failed to book appointment. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Update time slot to booked if single appointment
      if (selectedSlot.max_appointments === 1) {
        await supabase
          .from('doctor_schedules')
          .update({ status: 'booked' })
          .eq('id', selectedSlot.id);
      }

      toast({
        title: "Success!",
        description: "Appointment booked successfully!",
      });

      // Reset form and close dialog
      setSelectedSlot(null);
      setNotes("");
      setOpen(false);
      
      // Refresh available slots
      fetchAvailableTimeSlots();
      
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isPatient = profile?.role === 'patient';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-medical" />
            Book Appointment with Dr. {doctor.full_name}
          </DialogTitle>
        </DialogHeader>

        {!isPatient ? (
          <div className="text-center py-8">
            <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Patient Access Required
            </h3>
            <p className="text-muted-foreground">
              Only patients can book appointments. Please sign in with a patient account.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Doctor Info */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-medical-light rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-medical" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Dr. {doctor.full_name}</h3>
                    {doctor.specialization && (
                      <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                    )}
                    {doctor.consultation_fee && (
                      <p className="text-sm font-medium text-medical">
                        Consultation Fee: ${doctor.consultation_fee}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Time Slots */}
            <div>
              <Label className="text-base font-medium text-foreground mb-3 block">
                Select Available Time Slot
              </Label>
              
              {slotsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical"></div>
                </div>
              ) : timeSlots.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <h4 className="font-medium text-foreground mb-2">No Available Slots</h4>
                    <p className="text-sm text-muted-foreground">
                      This doctor doesn't have any available time slots at the moment.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3 max-h-60 overflow-y-auto">
                  {timeSlots.map((slot) => (
                    <Card
                      key={slot.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedSlot?.id === slot.id
                          ? 'ring-2 ring-medical border-medical'
                          : 'hover:border-medical/50'
                      }`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">
                                {formatDate(slot.date)}
                              </span>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                              </div>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Available
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            {selectedSlot && (
              <div>
                <Label htmlFor="notes" className="text-sm font-medium text-foreground">
                  Additional Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Describe your symptoms or reason for visit..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="mt-2"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBookAppointment}
                disabled={!selectedSlot || loading}
                className="bg-medical hover:bg-medical-secondary"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Calendar className="w-4 h-4 mr-2" />
                )}
                Book Appointment
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}