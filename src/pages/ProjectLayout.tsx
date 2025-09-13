import { Outlet } from "react-router-dom";
import ProjectSidebar from "@/components/ProjectSidebar";

const ProjectLayout = () => {
  return (
    <div className="flex h-screen bg-background">
      <ProjectSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default ProjectLayout;