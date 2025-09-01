import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, User, Calendar, Heart, AlertTriangle, Info, Newspaper } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'health_tip' | 'news' | 'emergency' | 'general';
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  author: {
    full_name: string;
    specialization?: string;
  };
}

const Announcements = () => {
  const { user, profile } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'patient' | 'doctor'>('patient');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (profile?.role) {
      setUserType(profile.role);
    }
  }, [profile?.role]);

  useEffect(() => {
    fetchAnnouncements();
  }, [user]);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          *,
          author:author_id(full_name, specialization)
        `)
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch announcements",
          variant: "destructive",
        });
        return;
      }

      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnouncements = selectedCategory === 'all' 
    ? announcements 
    : announcements.filter(a => a.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'health_tip': return <Heart className="w-4 h-4" />;
      case 'news': return <Newspaper className="w-4 h-4" />;
      case 'emergency': return <AlertTriangle className="w-4 h-4" />;
      case 'general': return <Info className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'health_tip': return 'bg-green-100 text-green-800';
      case 'news': return 'bg-blue-100 text-blue-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'general': return 'bg-gray-100 text-gray-800';
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
            <h1 className="text-3xl font-bold text-foreground">Health Announcements</h1>
            <p className="text-muted-foreground mt-2">
              Stay updated with the latest health tips, news, and important announcements
            </p>
          </div>
          
          {userType === 'doctor' && (
            <Link to="/post-announcement">
              <Button className="bg-medical hover:bg-medical-secondary">
                <MessageSquare className="w-4 h-4 mr-2" />
                Post Announcement
              </Button>
            </Link>
          )}
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="health_tip">Health Tips</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredAnnouncements.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No announcements found
              </h3>
              <p className="text-muted-foreground mb-4">
                {selectedCategory === 'all' 
                  ? "No announcements have been posted yet."
                  : `No ${selectedCategory.replace('_', ' ')} announcements found.`
                }
              </p>
              {userType === 'doctor' && (
                <Link to="/post-announcement">
                  <Button className="bg-medical hover:bg-medical-secondary">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Post First Announcement
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredAnnouncements.map((announcement) => (
              <Card key={announcement.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${getCategoryColor(announcement.category)}`}>
                          <span className="flex items-center gap-1">
                            {getCategoryIcon(announcement.category)}
                            {announcement.category.replace('_', ' ').toUpperCase()}
                          </span>
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {new Date(announcement.published_at || announcement.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <CardTitle className="text-xl mb-2">{announcement.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span>Dr. {announcement.author.full_name}</span>
                        {announcement.author.specialization && (
                          <span className="text-xs">- {announcement.author.specialization}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none text-muted-foreground">
                    {announcement.content.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-3 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  
                  {announcement.category === 'emergency' && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-800">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-medium">Emergency Notice</span>
                      </div>
                      <p className="text-sm text-red-700 mt-1">
                        For immediate assistance, please contact emergency services or use our WhatsApp support.
                      </p>
                      <Button 
                        size="sm" 
                        className="mt-2 bg-red-600 hover:bg-red-700"
                        onClick={() => window.open('https://wa.me/1234567890?text=' + encodeURIComponent('Emergency assistance needed'), '_blank')}
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Emergency Support
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;