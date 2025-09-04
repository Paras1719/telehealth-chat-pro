import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Phone, Mail, Calendar, MapPin, Stethoscope, GraduationCap, DollarSign, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Profile() {
  const { profile, updateProfile, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    bio: '',
    date_of_birth: '',
    gender: '',
    emergency_contact: '',
    specialization: '',
    qualifications: '',
    experience_years: '',
    consultation_fee: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        date_of_birth: profile.date_of_birth || '',
        gender: profile.gender || '',
        emergency_contact: profile.emergency_contact || '',
        specialization: profile.specialization || '',
        qualifications: profile.qualifications || '',
        experience_years: profile.experience_years?.toString() || '',
        consultation_fee: profile.consultation_fee?.toString() || ''
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updates: any = {
        full_name: formData.full_name,
        phone: formData.phone || null,
        bio: formData.bio || null,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        emergency_contact: formData.emergency_contact || null
      };

      if (profile?.role === 'doctor') {
        updates.specialization = formData.specialization || null;
        updates.qualifications = formData.qualifications || null;
        updates.experience_years = formData.experience_years ? parseInt(formData.experience_years) : null;
        updates.consultation_fee = formData.consultation_fee ? parseFloat(formData.consultation_fee) : null;
      }

      await updateProfile(updates);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <User className="w-8 h-8 text-medical mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">
            {profile.role === 'doctor' 
              ? 'Complete your doctor profile to start managing appointments and patients' 
              : 'Complete your patient profile for better healthcare services'
            }
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Avatar Section */}
          <Card>
            <CardContent className="p-6 text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage src={profile.avatar_url || ''} />
                <AvatarFallback className="text-xl">
                  {getInitials(profile.full_name || 'User')}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-lg">{profile.full_name}</h3>
              <p className="text-sm text-muted-foreground capitalize mb-4">{profile.role}</p>
              <div className="flex items-center justify-center text-sm text-muted-foreground mb-2">
                <Mail className="w-4 h-4 mr-2" />
                {user?.email}
              </div>
              {formData.phone && (
                <div className="flex items-center justify-center text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 mr-2" />
                  {formData.phone}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Input
                      id="gender"
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      placeholder="e.g., Male, Female, Other"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency_contact">Emergency Contact</Label>
                  <Input
                    id="emergency_contact"
                    value={formData.emergency_contact}
                    onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                    placeholder="Name and phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder={profile.role === 'doctor' 
                      ? "Tell patients about your approach to healthcare..." 
                      : "Tell us about yourself..."}
                    rows={3}
                  />
                </div>

                {/* Doctor-specific fields */}
                {profile.role === 'doctor' && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Stethoscope className="w-5 h-5 mr-2" />
                      Professional Information
                    </h3>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="specialization">Specialization</Label>
                        <Input
                          id="specialization"
                          value={formData.specialization}
                          onChange={(e) => handleInputChange('specialization', e.target.value)}
                          placeholder="e.g., Cardiology, Pediatrics"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="experience_years">Years of Experience</Label>
                        <Input
                          id="experience_years"
                          type="number"
                          value={formData.experience_years}
                          onChange={(e) => handleInputChange('experience_years', e.target.value)}
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="qualifications">Qualifications</Label>
                        <Input
                          id="qualifications"
                          value={formData.qualifications}
                          onChange={(e) => handleInputChange('qualifications', e.target.value)}
                          placeholder="e.g., MBBS, MD"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="consultation_fee">Consultation Fee ($)</Label>
                        <Input
                          id="consultation_fee"
                          type="number"
                          step="0.01"
                          value={formData.consultation_fee}
                          onChange={(e) => handleInputChange('consultation_fee', e.target.value)}
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}