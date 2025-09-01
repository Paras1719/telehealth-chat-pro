import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send, Heart, Newspaper, AlertTriangle, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const PostAnnouncement = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'patient' | 'doctor'>('doctor');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general' as 'health_tip' | 'news' | 'emergency' | 'general',
    is_published: false
  });

  useEffect(() => {
    if (profile?.role) {
      setUserType(profile.role);
      // Redirect if not a doctor
      if (profile.role !== 'doctor') {
        navigate('/announcements');
        toast({
          title: "Access Denied",
          description: "Only doctors can post announcements.",
          variant: "destructive",
        });
      }
    }
  }, [profile?.role, navigate]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to post announcements.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('announcements')
        .insert({
          title: formData.title.trim(),
          content: formData.content.trim(),
          category: formData.category,
          author_id: user.id,
          is_published: formData.is_published,
          published_at: formData.is_published ? new Date().toISOString() : null
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to post announcement. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success!",
        description: formData.is_published 
          ? "Announcement published successfully!" 
          : "Announcement saved as draft.",
      });

      // Reset form
      setFormData({
        title: '',
        content: '',
        category: 'general',
        is_published: false
      });

      // Navigate back to announcements
      navigate('/announcements');

    } catch (error) {
      console.error('Error posting announcement:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'health_tip': return <Heart className="w-4 h-4" />;
      case 'news': return <Newspaper className="w-4 h-4" />;
      case 'emergency': return <AlertTriangle className="w-4 h-4" />;
      case 'general': return <Info className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const categoryDescriptions = {
    health_tip: "Share health tips, preventive care advice, and wellness information",
    news: "Share medical news, updates about your practice, or healthcare developments",
    emergency: "Important urgent information that patients need to know immediately",
    general: "General announcements, practice updates, or other information"
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation userType={userType} onUserTypeChange={setUserType} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Post Announcement</h1>
          <p className="text-muted-foreground mt-2">
            Share important information, health tips, or updates with your patients
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-medical" />
              Create New Announcement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-sm font-medium text-foreground">
                Title *
              </Label>
              <Input
                id="title"
                placeholder="Enter announcement title..."
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="category" className="text-sm font-medium text-foreground">
                Category *
              </Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      General
                    </div>
                  </SelectItem>
                  <SelectItem value="health_tip">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      Health Tip
                    </div>
                  </SelectItem>
                  <SelectItem value="news">
                    <div className="flex items-center gap-2">
                      <Newspaper className="w-4 h-4" />
                      News
                    </div>
                  </SelectItem>
                  <SelectItem value="emergency">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Emergency
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {categoryDescriptions[formData.category]}
              </p>
            </div>

            <div>
              <Label htmlFor="content" className="text-sm font-medium text-foreground">
                Content *
              </Label>
              <Textarea
                id="content"
                placeholder="Write your announcement content here..."
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={8}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.content.length}/1000 characters
              </p>
            </div>

            {/* Preview Section */}
            {(formData.title || formData.content) && (
              <div className="border border-border rounded-lg p-4 bg-muted/30">
                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  {getCategoryIcon(formData.category)}
                  Preview
                </h4>
                <div className="space-y-2">
                  {formData.title && (
                    <h5 className="font-semibold text-lg text-foreground">{formData.title}</h5>
                  )}
                  {formData.content && (
                    <div className="text-muted-foreground whitespace-pre-wrap text-sm">
                      {formData.content}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-border">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="publish"
                  checked={formData.is_published}
                  onChange={(e) => handleInputChange('is_published', e.target.checked)}
                  className="rounded border-border"
                />
                <Label htmlFor="publish" className="text-sm text-foreground">
                  Publish immediately
                </Label>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/announcements')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !formData.title.trim() || !formData.content.trim()}
                  className="bg-medical hover:bg-medical-secondary"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {formData.is_published ? 'Publish' : 'Save Draft'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guidelines */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Posting Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Keep announcements professional and relevant to healthcare</li>
              <li>• Use clear, easy-to-understand language for all patients</li>
              <li>• Double-check medical information for accuracy</li>
              <li>• Emergency announcements will be highlighted to all users</li>
              <li>• Save as draft if you want to review before publishing</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostAnnouncement;