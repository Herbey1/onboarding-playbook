import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit, 
  Save, 
  Camera,
  Settings,
  Shield,
  Bell,
  Globe,
  Award,
  Target,
  TrendingUp,
  BookOpen,
  Code2,
  Clock,
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { User as SupabaseUser } from "@supabase/supabase-js";

// Mock data for user profile
const mockUserData = {
  id: "1",
  email: "usuario@ejemplo.com",
  firstName: "Ana",
  lastName: "García",
  fullName: "Ana García",
  bio: "Desarrolladora Full Stack especializada en React y Node.js. Apasionada por crear experiencias de usuario excepcionales y mentor de equipos de desarrollo.",
  company: "TechCorp Solutions",
  role: "Senior Frontend Developer",
  location: "Madrid, España",
  phone: "+34 600 123 456",
  website: "https://angarcia.dev",
  githubUsername: "anagarcia-dev",
  linkedinProfile: "anagarcia-dev",
  joinedDate: "2023-08-15",
  avatarUrl: "",
  preferences: {
    language: "es",
    timezone: "Europe/Madrid",
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
    theme: "light"
  },
  stats: {
    projectsCompleted: 12,
    lessonsCompleted: 89,
    totalLearningTime: "156h",
    currentStreak: 7,
    averageRating: 4.8,
    mentorshipSessions: 23
  },
  achievements: [
    { id: "1", title: "Primer Proyecto", description: "Completaste tu primer proyecto", icon: "🎯", date: "2023-08-20" },
    { id: "2", title: "Mentor Experto", description: "Mentoreaste a 10+ desarrolladores", icon: "👨‍🏫", date: "2023-10-15" },
    { id: "3", title: "Racha de 30 días", description: "Mantuviste una racha de aprendizaje de 30 días", icon: "🔥", date: "2023-11-01" },
    { id: "4", title: "Evaluación Perfecta", description: "Obtuviste 5 estrellas en todas las evaluaciones", icon: "⭐", date: "2023-12-10" }
  ],
  recentActivity: [
    { id: "1", type: "lesson_completed", title: "Completaste 'Arquitectura de Microservicios'", date: "2024-01-15", project: "Backend API" },
    { id: "2", type: "project_joined", title: "Te uniste al proyecto 'Dashboard Analytics'", date: "2024-01-14", project: "Dashboard Analytics" },
    { id: "3", type: "mentor_session", title: "Sesión de mentoría con equipo junior", date: "2024-01-13", project: "Mobile App" },
    { id: "4", type: "achievement_earned", title: "Desbloqueaste 'Evaluación Perfecta'", date: "2024-01-12", project: null }
  ]
};

const Profile = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userData, setUserData] = useState(mockUserData);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: userData.firstName,
    lastName: userData.lastName,
    bio: userData.bio,
    company: userData.company,
    role: userData.role,
    location: userData.location,
    phone: userData.phone,
    website: userData.website,
    githubUsername: userData.githubUsername,
    linkedinProfile: userData.linkedinProfile
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSaveProfile = async () => {
    try {
      // In a real app, this would update the user profile in Supabase
      setUserData({
        ...userData,
        ...editForm,
        fullName: `${editForm.firstName} ${editForm.lastName}`
      });
      setIsEditing(false);
      toast({
        title: "Perfil actualizado",
        description: "Tus cambios se han guardado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive"
      });
    }
  };

  const handlePreferenceChange = (key: string, value: any) => {
    setUserData({
      ...userData,
      preferences: {
        ...userData.preferences,
        [key]: value
      }
    });
    toast({
      title: "Preferencia actualizada",
      description: "El cambio se ha guardado automáticamente",
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "lesson_completed": return <BookOpen className="h-4 w-4 text-green-600" />;
      case "project_joined": return <Users className="h-4 w-4 text-blue-600" />;
      case "mentor_session": return <User className="h-4 w-4 text-purple-600" />;
      case "achievement_earned": return <Award className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="content-width py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-stepable-3xl font-bold text-gradient-primary">Mi Perfil</h1>
              <p className="text-muted-foreground mt-1">
                Gestiona tu información personal y preferencias
              </p>
            </div>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="hover-scale"
            >
              Volver al Dashboard
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="stepable-card hover-lift">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="relative inline-block mb-4">
                    <Avatar className="w-24 h-24 border-4 border-primary/20">
                      <AvatarImage src={userData.avatarUrl} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                        {getInitials(userData.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="absolute -bottom-2 -right-2 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all"
                    >
                      <Camera className="h-4 w-4" />
                    </motion.button>
                  </div>
                  
                  <h2 className="text-stepable-xl font-bold mb-1">{userData.fullName}</h2>
                  <p className="text-muted-foreground mb-2">{userData.role}</p>
                  <p className="text-sm text-muted-foreground mb-4">{userData.company}</p>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4" />
                    {userData.location}
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Miembro desde {new Date(userData.joinedDate).toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="stepable-card mt-6">
                <CardHeader>
                  <CardTitle className="text-stepable-xl flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Estadísticas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-stepable-xl font-bold text-primary">{userData.stats.projectsCompleted}</div>
                      <div className="text-xs text-muted-foreground">Proyectos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-stepable-xl font-bold text-accent">{userData.stats.lessonsCompleted}</div>
                      <div className="text-xs text-muted-foreground">Lecciones</div>
                    </div>
                    <div className="text-center">
                      <div className="text-stepable-xl font-bold text-secondary">{userData.stats.totalLearningTime}</div>
                      <div className="text-xs text-muted-foreground">Tiempo</div>
                    </div>
                    <div className="text-center">
                      <div className="text-stepable-xl font-bold text-warning">{userData.stats.currentStreak}</div>
                      <div className="text-xs text-muted-foreground">Racha</div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Calificación promedio</span>
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-yellow-500" />
                        <span className="font-bold">{userData.stats.averageRating}/5</span>
                      </div>
                    </div>
                    <Progress value={(userData.stats.averageRating / 5) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal" className="text-sm">
                  <User className="h-4 w-4 mr-2" />
                  Personal
                </TabsTrigger>
                <TabsTrigger value="preferences" className="text-sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Preferencias
                </TabsTrigger>
                <TabsTrigger value="achievements" className="text-sm">
                  <Award className="h-4 w-4 mr-2" />
                  Logros
                </TabsTrigger>
                <TabsTrigger value="activity" className="text-sm">
                  <Clock className="h-4 w-4 mr-2" />
                  Actividad
                </TabsTrigger>
              </TabsList>

              {/* Personal Information */}
              <TabsContent value="personal">
                <Card className="stepable-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-stepable-xl">Información Personal</CardTitle>
                        <CardDescription>
                          Actualiza tu información de perfil y contacto
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                        className="hover-scale"
                      >
                        {isEditing ? (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Guardar
                          </>
                        ) : (
                          <>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Nombre</Label>
                        <Input
                          id="firstName"
                          value={isEditing ? editForm.firstName : userData.firstName}
                          onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Apellidos</Label>
                        <Input
                          id="lastName"
                          value={isEditing ? editForm.lastName : userData.lastName}
                          onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="bio">Biografía</Label>
                      <Textarea
                        id="bio"
                        value={isEditing ? editForm.bio : userData.bio}
                        onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                        disabled={!isEditing}
                        className="mt-1 min-h-[100px]"
                        placeholder="Cuéntanos sobre ti..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="company">Empresa</Label>
                        <Input
                          id="company"
                          value={isEditing ? editForm.company : userData.company}
                          onChange={(e) => setEditForm({...editForm, company: e.target.value})}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">Rol</Label>
                        <Input
                          id="role"
                          value={isEditing ? editForm.role : userData.role}
                          onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="location">Ubicación</Label>
                        <Input
                          id="location"
                          value={isEditing ? editForm.location : userData.location}
                          onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                          id="phone"
                          value={isEditing ? editForm.phone : userData.phone}
                          onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="website">Sitio web</Label>
                        <Input
                          id="website"
                          value={isEditing ? editForm.website : userData.website}
                          onChange={(e) => setEditForm({...editForm, website: e.target.value})}
                          disabled={!isEditing}
                          className="mt-1"
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="github">GitHub</Label>
                        <Input
                          id="github"
                          value={isEditing ? editForm.githubUsername : userData.githubUsername}
                          onChange={(e) => setEditForm({...editForm, githubUsername: e.target.value})}
                          disabled={!isEditing}
                          className="mt-1"
                          placeholder="usuario-github"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={isEditing ? editForm.linkedinProfile : userData.linkedinProfile}
                        onChange={(e) => setEditForm({...editForm, linkedinProfile: e.target.value})}
                        disabled={!isEditing}
                        className="mt-1"
                        placeholder="usuario-linkedin"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preferences */}
              <TabsContent value="preferences">
                <Card className="stepable-card">
                  <CardHeader>
                    <CardTitle className="text-stepable-xl">Preferencias</CardTitle>
                    <CardDescription>
                      Personaliza tu experiencia en Stepable
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="language">Idioma</Label>
                        <Select 
                          value={userData.preferences.language}
                          onValueChange={(value) => handlePreferenceChange('language', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="es">Español</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="timezone">Zona horaria</Label>
                        <Select 
                          value={userData.preferences.timezone}
                          onValueChange={(value) => handlePreferenceChange('timezone', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Europe/Madrid">Madrid (CET)</SelectItem>
                            <SelectItem value="America/New_York">Nueva York (EST)</SelectItem>
                            <SelectItem value="America/Los_Angeles">Los Angeles (PST)</SelectItem>
                            <SelectItem value="UTC">UTC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notificaciones
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="email-notifications">Notificaciones por email</Label>
                            <p className="text-sm text-muted-foreground">
                              Recibe actualizaciones importantes por correo
                            </p>
                          </div>
                          <Switch
                            id="email-notifications"
                            checked={userData.preferences.emailNotifications}
                            onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="push-notifications">Notificaciones push</Label>
                            <p className="text-sm text-muted-foreground">
                              Recibe notificaciones en tiempo real
                            </p>
                          </div>
                          <Switch
                            id="push-notifications"
                            checked={userData.preferences.pushNotifications}
                            onCheckedChange={(checked) => handlePreferenceChange('pushNotifications', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="weekly-reports">Informes semanales</Label>
                            <p className="text-sm text-muted-foreground">
                              Resumen semanal de tu progreso
                            </p>
                          </div>
                          <Switch
                            id="weekly-reports"
                            checked={userData.preferences.weeklyReports}
                            onCheckedChange={(checked) => handlePreferenceChange('weeklyReports', checked)}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Achievements */}
              <TabsContent value="achievements">
                <Card className="stepable-card">
                  <CardHeader>
                    <CardTitle className="text-stepable-xl">Logros Desbloqueados</CardTitle>
                    <CardDescription>
                      Tus principales hitos y reconocimientos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userData.achievements.map((achievement, index) => (
                        <motion.div
                          key={achievement.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="text-2xl">{achievement.icon}</div>
                                <div className="flex-1">
                                  <h4 className="font-semibold">{achievement.title}</h4>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {achievement.description}
                                  </p>
                                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(achievement.date).toLocaleDateString('es-ES')}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activity */}
              <TabsContent value="activity">
                <Card className="stepable-card">
                  <CardHeader>
                    <CardTitle className="text-stepable-xl">Actividad Reciente</CardTitle>
                    <CardDescription>
                      Tu historial de actividades en los últimos días
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userData.recentActivity.map((activity, index) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="mt-1">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{activity.title}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {new Date(activity.date).toLocaleDateString('es-ES', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {activity.project && (
                                <Badge variant="outline" className="text-xs">
                                  {activity.project}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;