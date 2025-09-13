import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useProjects } from "@/hooks/useProjects";

export function useProjectActions() {
  const { deleteProject, joinProjectByCode, leaveProject } = useProjects();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDeleteProject = async (projectId: string) => {
    setLoading(true);
    try {
      await deleteProject(projectId);
      toast({
        title: "Proyecto eliminado",
        description: "El proyecto ha sido eliminado exitosamente"
      });
      return true;
    } catch (error) {
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveProject = async (projectId: string) => {
    setLoading(true);
    try {
      const success = await leaveProject(projectId);
      if (success) {
        toast({
          title: "Has salido del proyecto",
          description: "Ya no formas parte de este proyecto"
        });
      }
      return success;
    } catch (error) {
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleJoinProject = async (inviteCode: string) => {
    setLoading(true);
    try {
      await joinProjectByCode(inviteCode);
      return true;
    } catch (error) {
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    handleDeleteProject,
    handleLeaveProject,
    handleJoinProject,
    loading
  };
}
