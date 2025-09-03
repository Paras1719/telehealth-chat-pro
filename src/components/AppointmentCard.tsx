import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Phone, MessageSquare, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

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

interface AppointmentCardProps {
  appointment: Appointment;
  onReschedule?: (appointmentId: string) => void;
  onCancel?: (appointmentId: string) => void;
  onContact?: (phone: string, name: string) => void;
}

export function AppointmentCard({ appointment, onReschedule, onCancel, onContact }: AppointmentCardProps) {
  const { profile } = useAuth();
  const userType = profile?.role || 'patient';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canReschedule = appointment.status === 'scheduled';
  const showContactInfo = userType === 'doctor' ? appointment.patient : appointment.doctor;

  return (
    <Card className="hover:shadow-lg transition-shadow">
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
          <Badge className={getStatusColor(appointment.status)}>
            {appointment.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Show other party info */}
          {showContactInfo && (
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-medical" />
                <div>
                  <span className="font-medium">
                    {userType === 'patient' ? `Dr. ${showContactInfo.full_name}` : showContactInfo.full_name}
                  </span>
                  {userType === 'patient' && appointment.doctor?.specialization && (
                    <span className="text-muted-foreground ml-2">
                      - {appointment.doctor.specialization}
                    </span>
                  )}
                </div>
              </div>
              {showContactInfo.phone && onContact && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onContact(showContactInfo.phone!, showContactInfo.full_name)}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`tel:${showContactInfo.phone}`)}
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {appointment.notes && (
            <div>
              <h4 className="font-medium text-sm text-foreground mb-1">Notes:</h4>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                {appointment.notes}
              </p>
            </div>
          )}

          {appointment.patient_notes && userType === 'doctor' && (
            <div>
              <h4 className="font-medium text-sm text-foreground mb-1">Patient Notes:</h4>
              <p className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md">
                {appointment.patient_notes}
              </p>
            </div>
          )}

          {appointment.doctor_notes && userType === 'patient' && (
            <div>
              <h4 className="font-medium text-sm text-foreground mb-1">Doctor Notes:</h4>
              <p className="text-sm text-muted-foreground bg-green-50 p-3 rounded-md">
                {appointment.doctor_notes}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-4 border-t border-border">
            {canReschedule && onReschedule && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onReschedule(appointment.id)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Reschedule
              </Button>
            )}
            
            {canReschedule && onCancel && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onCancel(appointment.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            )}

            {showContactInfo?.phone && onContact && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onContact(showContactInfo.phone!, showContactInfo.full_name)}
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Message
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}