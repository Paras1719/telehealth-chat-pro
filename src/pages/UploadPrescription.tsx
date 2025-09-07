import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Upload, Plus, Trash2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

const UploadPrescription = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'patient' | 'doctor'>('doctor');
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_phone: '',
    diagnosis: '',
    notes: '',
    medications: [
      { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
    ] as Medication[]
  });

  useEffect(() => {
    if (profile?.role) {
      setUserType(profile.role);
      // Redirect if not a doctor
      if (profile.role !== 'doctor') {
        navigate('/prescriptions');
        toast({
          title: "Access Denied",
          description: "Only doctors can upload prescriptions.",
          variant: "destructive",
        });
      }
    }
  }, [profile?.role, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMedicationChange = (index: number, field: keyof Medication, value: string) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    }));
  };

  const removeMedication = (index: number) => {
    if (formData.medications.length > 1) {
      setFormData(prev => ({
        ...prev,
        medications: prev.medications.filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    if (!formData.patient_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Patient name is required.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.diagnosis.trim()) {
      toast({
        title: "Validation Error", 
        description: "Diagnosis is required.",
        variant: "destructive",
      });
      return false;
    }

    const validMedications = formData.medications.filter(med => 
      med.name.trim() && med.dosage.trim() && med.frequency.trim() && med.duration.trim()
    );

    if (validMedications.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one complete medication entry is required.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to create prescriptions.",
          variant: "destructive",
        });
        return;
      }

      // Filter valid medications
      const validMedications = formData.medications.filter(med => 
        med.name.trim() && med.dosage.trim() && med.frequency.trim() && med.duration.trim()
      );

      // First, find the patient by name to get their patient_id
      const { data: patientData, error: patientError } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .eq('full_name', formData.patient_name.trim())
        .eq('role', 'patient')
        .maybeSingle();

      if (patientError) {
        toast({
          title: "Error",
          description: "Failed to find patient. Please verify the patient name.",
          variant: "destructive",
        });
        return;
      }

      if (!patientData) {
        toast({
          title: "Patient Not Found",
          description: "No registered patient found with this name. Please ensure the patient is registered in the system.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('prescriptions')
        .insert({
          doctor_id: user.id,
          patient_id: patientData.user_id, // SECURE: Always use verified patient_id
          patient_name: formData.patient_name.trim(),
          patient_phone: formData.patient_phone.trim() || null,
          diagnosis: formData.diagnosis.trim(),
          medications: validMedications as any,
          notes: formData.notes.trim() || null
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create prescription. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Success!",
        description: "Prescription created successfully!",
      });

      // Send WhatsApp notification to patient
      if (formData.patient_phone) {
        const medicationsList = formData.medications
          .filter(med => med.name.trim())
          .map(med => `• ${med.name} - ${med.dosage} ${med.frequency} for ${med.duration}`)
          .join('\n');
        
        const whatsappMessage = encodeURIComponent(
          `🏥 Health_P - New Prescription\n\n` +
          `Dear ${formData.patient_name},\n\n` +
          `Dr. ${profile?.full_name} has prescribed:\n\n` +
          `📋 Diagnosis: ${formData.diagnosis}\n\n` +
          `💊 Medications:\n${medicationsList}\n\n` +
          `${formData.notes ? `📝 Notes: ${formData.notes}\n\n` : ''}` +
          `Please follow the instructions carefully. For any queries, contact your doctor.`
        );
        
        // Open WhatsApp with the prescription message
        window.open(`https://wa.me/${formData.patient_phone.replace(/\D/g, '')}?text=${whatsappMessage}`, '_blank');
      }

      // Reset form
      setFormData({
        patient_name: '',
        patient_phone: '',
        diagnosis: '',
        notes: '',
        medications: [
          { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
        ]
      });

      // Navigate back to prescriptions
      navigate('/prescriptions');

    } catch (error) {
      console.error('Error uploading prescription:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const frequencyOptions = [
    'Once daily',
    'Twice daily', 
    'Three times daily',
    'Four times daily',
    'Every 4 hours',
    'Every 6 hours',
    'Every 8 hours',
    'Every 12 hours',
    'As needed',
    'Before meals',
    'After meals',
    'At bedtime'
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation userType={userType} onUserTypeChange={setUserType} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Upload Prescription</h1>
          <p className="text-muted-foreground mt-2">
            Create and upload a new prescription for your patient
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-medical" />
              New Prescription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Patient Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patient_name" className="text-sm font-medium text-foreground">
                  Patient Name *
                </Label>
                <Input
                  id="patient_name"
                  placeholder="Enter patient's full name"
                  value={formData.patient_name}
                  onChange={(e) => handleInputChange('patient_name', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="patient_phone" className="text-sm font-medium text-foreground">
                  Patient Phone
                </Label>
                <Input
                  id="patient_phone"
                  placeholder="Enter patient's phone number"
                  value={formData.patient_phone}
                  onChange={(e) => handleInputChange('patient_phone', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="diagnosis" className="text-sm font-medium text-foreground">
                Diagnosis *
              </Label>
              <Input
                id="diagnosis"
                placeholder="Enter diagnosis"
                value={formData.diagnosis}
                onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Medications */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-sm font-medium text-foreground">
                  Medications *
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMedication}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Medication
                </Button>
              </div>

              <div className="space-y-4">
                {formData.medications.map((medication, index) => (
                  <Card key={index} className="p-4 border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-sm text-foreground">
                        Medication {index + 1}
                      </h4>
                      {formData.medications.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMedication(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Medication Name *</Label>
                        <Input
                          placeholder="e.g., Lisinopril"
                          value={medication.name}
                          onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Dosage *</Label>
                        <Input
                          placeholder="e.g., 10mg"
                          value={medication.dosage}
                          onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Frequency *</Label>
                        <Select 
                          value={medication.frequency} 
                          onValueChange={(value) => handleMedicationChange(index, 'frequency', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            {frequencyOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Duration *</Label>
                        <Input
                          placeholder="e.g., 30 days"
                          value={medication.duration}
                          onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <Label className="text-xs text-muted-foreground">Special Instructions</Label>
                      <Input
                        placeholder="e.g., Take with food"
                        value={medication.instructions}
                        onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm font-medium text-foreground">
                Additional Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Enter any additional instructions or notes for the patient..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>

            {/* Preview Section */}
            {(formData.patient_name || formData.diagnosis) && (
              <div className="border border-border rounded-lg p-4 bg-muted/30">
                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Prescription Preview
                </h4>
                <div className="space-y-3 text-sm">
                  {formData.patient_name && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-medical" />
                      <span className="font-medium">Patient:</span>
                      <span>{formData.patient_name}</span>
                    </div>
                  )}
                  {formData.diagnosis && (
                    <div>
                      <span className="font-medium">Diagnosis:</span>
                      <span className="ml-2">{formData.diagnosis}</span>
                    </div>
                  )}
                  {formData.medications.filter(med => med.name && med.dosage).length > 0 && (
                    <div>
                      <span className="font-medium">Medications:</span>
                      <ul className="ml-4 mt-1 space-y-1">
                        {formData.medications
                          .filter(med => med.name && med.dosage)
                          .map((med, index) => (
                            <li key={index} className="text-muted-foreground">
                              • {med.name} {med.dosage} - {med.frequency} for {med.duration}
                              {med.instructions && ` (${med.instructions})`}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={() => navigate('/prescriptions')}
                disabled={loading}
              >
                Cancel
              </Button>
              
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-medical hover:bg-medical-secondary"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Upload Prescription
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Guidelines */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Prescription Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Double-check all medication names, dosages, and instructions</li>
              <li>• Include clear instructions for patient understanding</li>
              <li>• Specify duration of treatment for each medication</li>
              <li>• Add any important warnings or precautions in notes</li>
              <li>• Ensure patient contact information is accurate</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UploadPrescription;