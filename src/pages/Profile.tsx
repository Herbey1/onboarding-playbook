import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, 
  Mail, 
  Calendar, 
  Edit, 
  Save, 
  Camera,
  Settings,
  Shield,
  Bell,
  Globe,
  Crown,
  Zap,
  Check,
  Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfiles";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { profile, loading, updateProfile, upgradeToPremiun } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: ''
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
    theme: 'light'
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && !loading) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setEditForm({
        full_name: profile.full_name || '',
        email: profile.email || ''
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      await updateProfile(editForm);
      setIsEditing(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/auth");
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cerrar sesión",
        variant: "destructive"
      });
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto max-w-6xl p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-stepable-3xl font-bold text-primary">Mi Perfil</h1>
            <p className="text-muted-foreground mt-1">
              Gestiona tu información personal y preferencias
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="hover-scale"
            >
              Volver al Dashboard
            </Button>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="hover-scale text-destructive hover:bg-destructive/10"
            >
              Cerrar Sesión
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
                      <AvatarImage src={profile?.avatar_url || ""} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                        {getInitials(profile?.full_name || profile?.email || "")}
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
                  
                  <h2 className="text-stepable-xl font-bold mb-1">
                    {profile?.full_name || profile?.email?.split('@')[0] || "Usuario"}
                  </h2>
                  <p className="text-muted-foreground mb-2">{profile?.email}</p>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Miembro desde {new Date(profile?.created_at || '').toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal" className="text-sm">
                  <User className="h-4 w-4 mr-2" />
                  Personal
                </TabsTrigger>
                <TabsTrigger value="subscription" className="text-sm">
                  <Crown className="h-4 w-4 mr-2" />
                  Suscripción
                </TabsTrigger>
                <TabsTrigger value="preferences" className="text-sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Preferencias
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
                          Actualiza tu información de perfil
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
                    <div>
                      <Label htmlFor="full_name">Nombre completo</Label>
                      <Input
                        id="full_name"
                        value={isEditing ? editForm.full_name : (profile?.full_name || '')}
                        onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                        disabled={!isEditing}
                        className="mt-1"
                        placeholder="Tu nombre completo"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={profile?.email || ''}
                        disabled={true}
                        className="mt-1"
                        placeholder="tu@email.com"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        El email no se puede cambiar
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Subscription Plans */}
              <TabsContent value="subscription">
                <div className="space-y-6">
                  {/* Current Plan */}
                  <Card className="stepable-card">
                    <CardHeader>
                      <CardTitle className="text-stepable-xl flex items-center gap-2">
                        <Crown className="h-5 w-5 text-primary" />
                        Plan Actual
                      </CardTitle>
                      <CardDescription>
                        Tu suscripción actual y beneficios
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="default" className="capitalize">
                              {profile?.subscription_plan === 'free' ? 'Gratuito' : profile?.subscription_plan}
                            </Badge>
                            <span className="text-sm text-muted-foreground">Plan actual</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {profile?.subscription_plan === 'free' ? (
                              <>
                                • 5 proyectos máximo<br/>
                                • Funciones básicas<br/>
                                • Soporte por comunidad
                              </>
                            ) : (
                              <>
                                • Proyectos ilimitados<br/>
                                • IA avanzada<br/>
                                • Soporte prioritario
                              </>
                            )}
                          </div>
                        </div>
                        {profile?.subscription_plan === 'premium' && (
                          <Crown className="h-8 w-8 text-accent" />
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Upgrade Options */}
                  {profile?.subscription_plan === 'free' && (
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Premium Plan */}
                      <motion.div
                        whileHover={{ scale: 1.02, y: -4 }}
                        className="relative"
                      >
                        <Card className="stepable-card border-accent/50 bg-gradient-to-br from-accent/5 to-primary/5">
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <Badge className="bg-accent text-white px-4 py-1">
                              <Star className="h-3 w-3 mr-1" />
                              Recomendado
                            </Badge>
                          </div>
                          <CardHeader className="text-center">
                            <CardTitle className="text-stepable-2xl text-accent flex items-center justify-center gap-2">
                              <Crown className="h-6 w-6" />
                              Premium
                            </CardTitle>
                            <CardDescription className="text-lg">
                              Para equipos que quieren más
                            </CardDescription>
                            <div className="text-stepable-3xl font-bold text-accent">
                              €29<span className="text-base text-muted-foreground">/mes</span>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-3">
                              {[
                                'Proyectos ilimitados',
                                'IA avanzada para generación',
                                'Analytics detallados',
                                'Integraciones premium',
                                'Soporte prioritario',
                                'Personalizaciones avanzadas'
                              ].map((feature) => (
                                <div key={feature} className="flex items-center gap-2">
                                  <Check className="h-4 w-4 text-accent" />
                                  <span className="text-sm">{feature}</span>
                                </div>
                              ))}
                            </div>
                            <Button 
                              onClick={upgradeToPremiun}
                              className="w-full bg-accent hover:bg-accent/90 text-white"
                            >
                              <Zap className="h-4 w-4 mr-2" />
                              Mejorar a Premium
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>

                      {/* Enterprise Plan */}
                      <Card className="stepable-card">
                        <CardHeader className="text-center">
                          <CardTitle className="text-stepable-2xl text-primary flex items-center justify-center gap-2">
                            <Shield className="h-6 w-6" />
                            Enterprise
                          </CardTitle>
                          <CardDescription className="text-lg">
                            Para organizaciones grandes
                          </CardDescription>
                          <div className="text-stepable-2xl font-bold text-primary">
                            Contactar
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            {[
                              'Todo de Premium',
                              'SSO y seguridad avanzada',
                              'Onboarding personalizado',
                              'Gestor de cuenta dedicado',
                              'SLA garantizado',
                              'API personalizada'
                            ].map((feature) => (
                              <div key={feature} className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-primary" />
                                <span className="text-sm">{feature}</span>
                              </div>
                            ))}
                          </div>
                          <Button variant="outline" className="w-full">
                            <Mail className="h-4 w-4 mr-2" />
                            Contactar Ventas
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Preferences */}
              <TabsContent value="preferences">
                <Card className="stepable-card">
                  <CardHeader>
                    <CardTitle className="text-stepable-xl">Preferencias</CardTitle>
                    <CardDescription>
                      Configura tus preferencias de notificaciones y privacidad
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Notifications */}
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Notificaciones
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Notificaciones por email</Label>
                            <p className="text-sm text-muted-foreground">
                              Recibe actualizaciones por correo
                            </p>
                          </div>
                          <Switch 
                            checked={preferences.emailNotifications}
                            onCheckedChange={(checked) => 
                              setPreferences({...preferences, emailNotifications: checked})
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Notificaciones push</Label>
                            <p className="text-sm text-muted-foreground">
                              Notificaciones en el navegador
                            </p>
                          </div>
                          <Switch 
                            checked={preferences.pushNotifications}
                            onCheckedChange={(checked) => 
                              setPreferences({...preferences, pushNotifications: checked})
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Reportes semanales</Label>
                            <p className="text-sm text-muted-foreground">
                              Resumen semanal de progreso
                            </p>
                          </div>
                          <Switch 
                            checked={preferences.weeklyReports}
                            onCheckedChange={(checked) => 
                              setPreferences({...preferences, weeklyReports: checked})
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Theme */}
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Apariencia
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Tema</Label>
                          <Select value={preferences.theme} onValueChange={(value) => 
                            setPreferences({...preferences, theme: value})
                          }>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="light">Claro</SelectItem>
                              <SelectItem value="dark">Oscuro</SelectItem>
                              <SelectItem value="system">Sistema</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
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