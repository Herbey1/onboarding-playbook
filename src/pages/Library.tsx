import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { 
  Upload, 
  Search, 
  MoreHorizontal, 
  FileText, 
  Edit3, 
  Eye, 
  Trash2,
  Download,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data para la biblioteca
const mockDocuments = [
  {
    id: "1",
    title: "Guía de Pull Requests",
    type: "Guía",
    format: "MD",
    lastModified: "2024-01-15",
    size: "12 KB",
    description: "Estándares y proceso para crear PRs efectivos"
  },
  {
    id: "2",
    title: "Plantilla de PR",
    type: "Plantilla", 
    format: "MD",
    lastModified: "2024-01-14",
    size: "3 KB",
    description: "Template para PULL_REQUEST_TEMPLATE.md"
  },
  {
    id: "3",
    title: "Convenciones de Naming",
    type: "Guía",
    format: "PDF",
    lastModified: "2024-01-12",
    size: "845 KB",
    description: "Nomenclatura para variables, funciones y archivos"
  },
  {
    id: "4",
    title: "Guía de Testing",
    type: "Guía",
    format: "MD",
    lastModified: "2024-01-10",
    size: "28 KB", 
    description: "Estrategias y buenas prácticas de testing"
  }
];

const Library = () => {
  const [documents] = useState(mockDocuments);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpload = () => {
    toast({
      title: "Próximamente",
      description: "La subida de documentos estará disponible pronto",
    });
  };

  const handleEdit = (docId: string) => {
    toast({
      title: "Próximamente", 
      description: "La edición de documentos estará disponible pronto",
    });
  };

  const handlePreview = (docId: string) => {
    toast({
      title: "Próximamente",
      description: "La previsualización estará disponible pronto",
    });
  };

  const handleDelete = (docId: string) => {
    toast({
      title: "Próximamente",
      description: "La eliminación estará disponible pronto",
    });
  };

  const getTypeColor = (type: string) => {
    return type === "Guía" ? "default" : "secondary";
  };

  const getFormatIcon = (format: string) => {
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-stepable-3xl font-bold">Biblioteca</h1>
            <p className="text-muted-foreground mt-1">
              Gestiona las guías y plantillas de tu proyecto
            </p>
          </div>
          <Button onClick={handleUpload} className="stepable-button">
            <Upload className="mr-2 h-4 w-4" />
            Subir documento
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 stepable-input"
          />
        </div>
      </div>

      {filteredDocuments.length > 0 ? (
        <Card className="stepable-card">
          <CardHeader>
            <CardTitle className="text-stepable-xl">Documentos del proyecto</CardTitle>
            <CardDescription>
              {filteredDocuments.length} documento{filteredDocuments.length !== 1 ? "s" : ""} encontrado{filteredDocuments.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Documento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Formato</TableHead>
                  <TableHead>Última edición</TableHead>
                  <TableHead>Tamaño</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {getFormatIcon(doc.format)}
                        <div>
                          <div className="font-medium">{doc.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {doc.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTypeColor(doc.type)}>
                        {doc.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{doc.format}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(doc.lastModified).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {doc.size}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handlePreview(doc.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Previsualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(doc.id)}>
                            <Edit3 className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Descargar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(doc.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : documents.length === 0 ? (
        // Empty state
        <Card className="stepable-card text-center py-12">
          <CardContent>
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-stepable-xl mb-2">
              Sube tu primera guía
            </CardTitle>
            <CardDescription className="mb-6 max-w-md mx-auto">
              Comienza subiendo la guía de Pull Requests o cualquier documento
              que defina cómo trabaja tu equipo.
            </CardDescription>
            <Button onClick={handleUpload} className="stepable-button">
              <Upload className="mr-2 h-4 w-4" />
              Subir documento
            </Button>
          </CardContent>
        </Card>
      ) : (
        // No search results
        <Card className="stepable-card text-center py-12">
          <CardContent>
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-stepable-xl mb-2">
              No se encontraron documentos
            </CardTitle>
            <CardDescription className="mb-6">
              No hay documentos que coincidan con "{searchTerm}"
            </CardDescription>
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              Limpiar búsqueda
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Library;