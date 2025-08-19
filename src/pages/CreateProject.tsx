import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProjectCreationWizard, { ProjectConfig } from "@/components/builder/ProjectCreationWizard";

const CreateProject = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateProject = async (config: ProjectConfig) => {
    setIsCreating(true);
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to create projects.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Check if user has API keys configured
      const savedKeys = localStorage.getItem('webcrafter_api_keys');
      if (!savedKeys) {
        toast({
          title: "API Keys Required",
          description: "Please configure your API keys in settings first.",
          variant: "destructive",
        });
        navigate("/settings");
        return;
      }

      const apiKeys = JSON.parse(savedKeys);
      const hasValidKey = Object.values(apiKeys).some((key: any) => key && key.trim() !== "");
      
      if (!hasValidKey) {
        toast({
          title: "API Keys Required",
          description: "Please configure at least one API key in settings.",
          variant: "destructive",
        });
        navigate("/settings");
        return;
      }

      // Add API keys to the config
      const configWithKeys = {
        ...config,
        apiKeys
      };

      // Generate project with AI
      const { data: aiData, error: aiError } = await supabase.functions.invoke('ai-project-generator', {
        body: configWithKeys
      });

      if (aiError) throw aiError;

      if (!aiData.files || Object.keys(aiData.files).length === 0) {
        throw new Error("AI failed to generate project files");
      }

      // Create project in database
      const { data: project, error: dbError } = await supabase
        .from("projects")
        .insert({
          name: config.title,
          description: config.description,
          content: aiData.files,
          user_id: user.id,
        })
        .select()
        .single();

      if (dbError) throw dbError;
      if (!project) throw new Error('Failed to create project');

      toast({
        title: "Project Created!",
        description: `Your AI-generated project "${config.title}" is ready!`,
      });

      // Navigate to the builder
      navigate(`/builder/${project.id}`);

    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Spline Background - More Visible */}
      <div className="fixed inset-0 z-0">
        <iframe 
          src='https://my.spline.design/orbittriangle-3S6GOic3EjNFF8CrhyvHizYQ/' 
          frameBorder='0' 
          width='100%' 
          height='100%'
          className="pointer-events-none scale-105 opacity-60"
        />
      </div>
      
      {/* Enhanced Glassmorphism Container */}
      <div className="relative z-10 min-h-screen bg-gradient-to-br from-background/20 via-background/10 to-background/20 backdrop-blur-xl">
        <div className="bg-gradient-to-br from-white/5 via-transparent to-white/5 min-h-screen">
          <ProjectCreationWizard 
            onCreateProject={handleCreateProject}
            isCreating={isCreating}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateProject;