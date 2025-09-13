import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Copy, 
  MoreHorizontal, 
  Users, 
  Key, 
  Globe, 
  Trash2,
  Edit3,
  Calendar,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data
const mockMembers = [
  {
    id: "1",
    email: "ana.garcia@empresa.com",
    role: "Owner",
    joinedAt: "2024-01-01",
    status: "active"
  },
  {
    id: "2", 
    email: "carlos.martinez@empresa.com",
    role: "Admin",
    joinedAt: "2024-01-05",
    status: "active"
  },
  {
    id: "3",
    email: "laura.rodriguez@empresa.com", 
    role: "Member",
    joinedAt: "2024-01-10",
    status: "active"
  }
];

const mockInviteCodes = [
  {
    id: "1",
    code: "TEAM2024",
    expiresAt: "2024-02-15",
    maxUses: 10,
    currentUses: 3,
    domainFilter: "empresa.com",
    createdAt: "2024-01-15"
  },
  {
    id: "2",
    code: "DEVS2024",
    expiresAt: "2024-01-30", 
    maxUses: 5,
    currentUses: 5,
    domainFilter: null,
    createdAt: "2024-01-10"
  }
];

const ProjectSettings = () => {
  const [members] = useState(mockMembers);
  const [inviteCodes] = useState(mockInviteCodes);
  const [projectLanguage, setProjectLanguage] = useState("es");
  const [newCodeConfig, setNewCodeConfig] = useState({
    maxUses: 10,
    expiresIn: 30,
    domainFilter: ""
  });
  const { toast } = useToast();

  const handleChangeRole = (memberId: string, newRole: string) => {
    toast({
      title: "Próximamente",
      description: "El cambio de roles estará disponible pronto",
    });
  };

  const handleRemoveMember = (memberId: string) => {
    toast({
      title: "Próximamente", 
      description: "La eliminación de miembros estará disponible pronto",
    });
  };

  const handleGenerateCode = () => {
    toast({
      title: "Próximamente",
      description: "La generación de códigos estará disponible pronto",
    });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Código copiado",
      description: "El código se ha copiado al portapapeles",
    });
  };

  const handleDeleteCode = (codeId: string) => {
    toast({
      title: "Próximamente",
      description: "La eliminación de códigos estará disponible pronto",
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Owner":
        return "default";
      case "Admin":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getCodeStatus = (code: any) => {
    const isExpired = new Date(code.expiresAt) < new Date();
    const isExhausted = code.currentUses >= code.maxUses;
    
    if (isExpired) return { label: "Expirado", variant: "destructive" as const };
    if (isExhausted) return { label: "Agotado", variant: "secondary" as const };
    return { label: "Activo", variant: "default" as const };
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-stepable-3xl font-bold">Ajustes del Proyecto</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona roles, códigos de acceso y configuración general
        </p>
      </div>

      {/* Team Members */}
      <Card className="stepable-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-stepable-xl flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Miembros del equipo</span>
              </CardTitle>
              <CardDescription>
                Gestiona los roles y permisos de los miembros
              </CardDescription>
            </div>
            <Button className="stepable-button">
              <Plus className="mr-2 h-4 w-4" />
              Invitar miembro
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Se unió</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm">
                        {member.email.substring(0, 2).toUpperCase()}
                      </div>
                      <span>{member.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleColor(member.role)}>
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {member.role !== "Owner" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleChangeRole(member.id, "Admin")}>
                            <Shield className="mr-2 h-4 w-4" />
                            Hacer Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleChangeRole(member.id, "Member")}>
                            <Users className="mr-2 h-4 w-4" />
                            Hacer Member
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invite Codes */}
      <Card className="stepable-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-stepable-xl flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>Códigos de invitación</span>
              </CardTitle>
              <CardDescription>
                Genera códigos para que otros se unan al proyecto
              </CardDescription>
            </div>
            <Button onClick={handleGenerateCode} className="stepable-button">
              <Plus className="mr-2 h-4 w-4" />
              Generar código
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Code Generation Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="maxUses">Máximo de usos</Label>
              <Input
                id="maxUses"
                type="number"
                value={newCodeConfig.maxUses}
                onChange={(e) => setNewCodeConfig({...newCodeConfig, maxUses: parseInt(e.target.value)})}
                className="stepable-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiresIn">Expira en (días)</Label>
              <Input
                id="expiresIn"
                type="number"
                value={newCodeConfig.expiresIn}
                onChange={(e) => setNewCodeConfig({...newCodeConfig, expiresIn: parseInt(e.target.value)})}
                className="stepable-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="domainFilter">Filtro de dominio (opcional)</Label>
              <Input
                id="domainFilter"
                placeholder="empresa.com"
                value={newCodeConfig.domainFilter}
                onChange={(e) => setNewCodeConfig({...newCodeConfig, domainFilter: e.target.value})}
                className="stepable-input"
              />
            </div>
          </div>

          {/* Existing Codes */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Usos</TableHead>
                <TableHead>Expira</TableHead>
                <TableHead>Dominio</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inviteCodes.map((code) => {
                const status = getCodeStatus(code);
                return (
                  <TableRow key={code.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <code className="bg-muted px-2 py-1 rounded text-sm">
                          {code.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyCode(code.code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {code.currentUses}/{code.maxUses}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(code.expiresAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {code.domainFilter ? (
                        <Badge variant="outline">{code.domainFilter}</Badge>
                      ) : (
                        <span className="text-muted-foreground">Sin filtro</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleCopyCode(code.code)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copiar código
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit3 className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteCode(code.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card className="stepable-card">
        <CardHeader>
          <CardTitle className="text-stepable-xl flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Configuración general</span>
          </CardTitle>
          <CardDescription>
            Ajustes de idioma y configuración del proyecto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-md space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Idioma del proyecto</Label>
              <Select value={projectLanguage} onValueChange={setProjectLanguage}>
                <SelectTrigger className="stepable-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Idioma por defecto para el contenido del onboarding
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectSettings;
