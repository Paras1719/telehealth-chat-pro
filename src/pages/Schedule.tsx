import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Plus, Edit, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface TimeSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'available' | 'booked' | 'blocked';
  patient_name?: string;
  patient_phone?: string;
  notes?: string;
}

// Mock schedule data - in a real app, this would come from Supabase
const mockSchedule: TimeSlot[] = [
  {
    id: '1',
    date: '2024-01-16',
    start_time: '09:00',
    end_time: '09:30',
    status: 'booked',
    patient_name: 'John Doe',
    patient_phone: '+1234567890',
    notes: 'Follow-up appointment for hypertension'
  },
  {
    id: '2',
    date: '2024-01-16',
    start_time: '09:30',
    end_time: '10:00',
    status: 'available'
  },
  {
    id: '3',
    date: '2024-01-16',
    start_time: '10:00',
    end_time: '10:30',
    status: 'booked',
    patient_name: 'Jane Smith',
    patient_phone: '+1234567891',
    notes: 'Regular checkup'
  },
  {
    id: '4',
    date: '2024-01-16',
    start_time: '11:00',
    end_time: '11:30',
    status: 'available'
  },
  {
    id: '5',
    date: '2024-01-17',
    start_time: '09:00',
    end_time: '09:30',
    status: 'blocked'
  },
  {
    id: '6',
    date: '2024-01-17',
    start_time: '14:00',
    end_time: '14:30',
    status: 'available'
  }
];

const Schedule = () => {
  const { user, profile } = useAuth();
  const [schedule, setSchedule] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'patient' | 'doctor'>('doctor');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (profile?.role) {
      setUserType(profile.role);
    }
  }, [profile?.role]);

  useEffect(() => {
    // Simulate loading schedule
    setTimeout(() => {
      setSchedule(mockSchedule);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredSchedule = schedule.filter(slot => slot.date === selectedDate);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'booked': return 'bg-blue-100 text-blue-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleContactPatient = (phone: string, patientName: string) => {
    const message = encodeURIComponent(`Hi ${patientName}, this is Dr. ${profile?.full_name}. Regarding your upcoming appointment.`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleAddSlot = () => {
    toast({
      title: "Add Time Slot",
      description: "Feature coming soon - Add new available time slots",
    });
  };

  const handleEditSlot = (slotId: string) => {
    toast({
      title: "Edit Time Slot",
      description: "Feature coming soon - Edit time slot details",
    });
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
                        
                        {slot.notes && (
                          <div>
                            <h4 className="font-medium text-sm text-foreground mb-1">Notes:</h4>
                            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                              {slot.notes}
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
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-green-600" />
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
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
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
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-red-600" />
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
      </div>
    </div>
  );
};

export default Schedule;