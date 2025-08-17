import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Github, GitBranch, Check, Loader2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GitHubIntegrationProps {
  projectContent: Record<string, string>;
  projectName: string;
}

const GitHubIntegration = ({ projectContent, projectName }: GitHubIntegrationProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [repositories, setRepositories] = useState<any[]>([]);
  const [newRepoName, setNewRepoName] = useState(projectName.toLowerCase().replace(/\s+/g, '-'));
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [isCreatingRepo, setIsCreatingRepo] = useState(false);
  const [isDeploy, setIsDeploy] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated
    const accessToken = localStorage.getItem('github_access_token');
    const userData = localStorage.getItem('github_user');
    
    if (accessToken && userData) {
      setIsConnected(true);
      setUser(JSON.parse(userData));
      fetchRepositories(accessToken);
    }
    
    // Handle OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state === 'github-oauth') {
      handleOAuthCallback(code);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleOAuthCallback = async (code: string) => {
    try {
      setIsConnecting(true);
      
      // In a real implementation, you would exchange the code for an access token
      // through your backend. For demo purposes, we'll simulate this.
      const mockResponse = {
        access_token: 'gho_mock_token_' + Math.random().toString(36).substr(2, 9),
        user: {
          login: 'demo_user',
          name: 'Demo User',
          avatar_url: 'https://github.com/github.png',
          html_url: 'https://github.com/demo_user'
        }
      };
      
      localStorage.setItem('github_access_token', mockResponse.access_token);
      localStorage.setItem('github_user', JSON.stringify(mockResponse.user));
      
      setIsConnected(true);
      setUser(mockResponse.user);
      
      await fetchRepositories(mockResponse.access_token);
      
      toast({
        title: "GitHub Connected!",
        description: "Successfully connected to your GitHub account.",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to GitHub. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchRepositories = async (accessToken: string) => {
    try {
      // Mock repositories for demo
      const mockRepos = [
        { name: 'my-website', description: 'Personal website', private: false, html_url: 'https://github.com/demo_user/my-website' },
        { name: 'portfolio', description: 'Portfolio site', private: false, html_url: 'https://github.com/demo_user/portfolio' },
        { name: 'blog', description: 'My blog', private: true, html_url: 'https://github.com/demo_user/blog' },
      ];
      
      setRepositories(mockRepos);
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
    }
  };

  const connectToGitHub = () => {
    const clientId = 'demo_client_id'; // In real app, this would be your GitHub App's client ID
    const redirectUri = window.location.origin + window.location.pathname;
    const scope = 'repo,user';
    const state = 'github-oauth';
    
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
    
    // In demo mode, simulate the OAuth flow
    toast({
      title: "GitHub OAuth",
      description: "Redirecting to GitHub for authentication...",
    });
    
    setTimeout(() => {
      const mockCode = 'mock_auth_code_' + Math.random().toString(36).substr(2, 9);
      handleOAuthCallback(mockCode);
    }, 2000);
  };

  const createRepository = async () => {
    if (!newRepoName.trim()) {
      toast({
        title: "Repository Name Required",
        description: "Please enter a name for your repository.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingRepo(true);
    
    try {
      // Simulate repository creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newRepo = {
        name: newRepoName,
        description: `Generated by WebCrafter - ${projectName}`,
        private: false,
        html_url: `https://github.com/${user.login}/${newRepoName}`
      };
      
      // Simulate file upload
      await uploadProjectFiles(newRepo);
      
      setRepositories(prev => [newRepo, ...prev]);
      setSelectedRepo(newRepoName);
      
      toast({
        title: "Repository Created!",
        description: `Successfully created and uploaded to ${newRepoName}`,
      });
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create repository. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingRepo(false);
    }
  };

  const uploadProjectFiles = async (repo: any) => {
    // Structure files properly
    const structuredFiles = {
      'package.json': JSON.stringify({
        name: repo.name,
        version: "1.0.0",
        type: "module",
        scripts: {
          dev: "vite",
          build: "vite build",
          preview: "vite preview"
        },
        dependencies: {
          react: "^18.3.1",
          "react-dom": "^18.3.1"
        },
        devDependencies: {
          "@types/react": "^18.3.1",
          "@types/react-dom": "^18.3.1",
          vite: "^5.0.0"
        }
      }, null, 2),
      'README.md': `# ${repo.name}\n\nGenerated by WebCrafter\n\n## Getting Started\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\``,
      'index.html': projectContent['index.html'] || '<!DOCTYPE html><html><head><title>My App</title></head><body><div id="root"></div></body></html>',
      ...Object.entries(projectContent).reduce((acc, [key, value]) => {
        if (key !== 'index.html') {
          acc[`src/${key}`] = value;
        }
        return acc;
      }, {} as Record<string, string>)
    };
    
    // Simulate file upload with progress
    const fileCount = Object.keys(structuredFiles).length;
    let uploaded = 0;
    
    for (const [path, content] of Object.entries(structuredFiles)) {
      await new Promise(resolve => setTimeout(resolve, 200));
      uploaded++;
      // Could emit progress events here
    }
    
    return structuredFiles;
  };

  const deployToRepo = async (repoName: string) => {
    setIsDeploy(true);
    
    try {
      const repo = repositories.find(r => r.name === repoName);
      if (!repo) throw new Error('Repository not found');
      
      await uploadProjectFiles(repo);
      
      toast({
        title: "Deployed Successfully!",
        description: `Project deployed to ${repoName}`,
      });
      
      setShowDialog(false);
    } catch (error) {
      toast({
        title: "Deployment Failed",
        description: "Failed to deploy to repository. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeploy(false);
    }
  };

  const disconnect = () => {
    localStorage.removeItem('github_access_token');
    localStorage.removeItem('github_user');
    setIsConnected(false);
    setUser(null);
    setRepositories([]);
    
    toast({
      title: "Disconnected",
      description: "Successfully disconnected from GitHub.",
    });
  };

  if (!isConnected) {
    return (
      <Card className="p-6 text-center">
        <Github className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Connect to GitHub</h3>
        <p className="text-muted-foreground mb-4">
          Connect your GitHub account to save and manage your projects in repositories.
        </p>
        <Button onClick={connectToGitHub} disabled={isConnecting} className="w-full">
          {isConnecting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Github className="w-4 h-4 mr-2" />
              Connect GitHub Account
            </>
          )}
        </Button>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img src={user.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full" />
            <div>
              <div className="font-semibold">{user.name}</div>
              <div className="text-sm text-muted-foreground">@{user.login}</div>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-500/10 text-green-600">
            <Check className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        </div>
        
        <div className="space-y-3">
          <Button onClick={() => setShowDialog(true)} className="w-full">
            <GitBranch className="w-4 h-4 mr-2" />
            Deploy to Repository
          </Button>
          
          <Button variant="outline" onClick={disconnect} className="w-full">
            Disconnect GitHub
          </Button>
        </div>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Deploy to GitHub Repository</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Create New Repository */}
            <Card className="p-4">
              <h4 className="font-semibold mb-3">Create New Repository</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="repo-name">Repository Name</Label>
                  <Input
                    id="repo-name"
                    value={newRepoName}
                    onChange={(e) => setNewRepoName(e.target.value)}
                    placeholder="my-awesome-project"
                  />
                </div>
                <Button 
                  onClick={createRepository} 
                  disabled={isCreatingRepo || !newRepoName.trim()}
                  className="w-full"
                >
                  {isCreatingRepo ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Repository...
                    </>
                  ) : (
                    'Create & Deploy'
                  )}
                </Button>
              </div>
            </Card>

            {/* Existing Repositories */}
            {repositories.length > 0 && (
              <Card className="p-4">
                <h4 className="font-semibold mb-3">Deploy to Existing Repository</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {repositories.map((repo) => (
                    <div
                      key={repo.name}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{repo.name}</span>
                          {repo.private && <Badge variant="outline" className="text-xs">Private</Badge>}
                        </div>
                        {repo.description && (
                          <div className="text-sm text-muted-foreground">{repo.description}</div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(repo.html_url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => deployToRepo(repo.name)}
                          disabled={isDeploy}
                        >
                          {isDeploy ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Deploy'
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GitHubIntegration;
