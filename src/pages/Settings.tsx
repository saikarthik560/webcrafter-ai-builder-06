import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Key, Save, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import ApiKeyInput from "@/components/common/ApiKeyInput";
import HamburgerMenu from "@/components/common/HamburgerMenu";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState({
    openrouter: "",
    openai: "",
    deepseek: "",
    gemini: "",
    anthropic: "",
  });
  const [showKeys, setShowKeys] = useState({
    openrouter: false,
    openai: false,
    deepseek: false,
    gemini: false,
    anthropic: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = () => {
    const saved = localStorage.getItem('webcrafter_api_keys');
    if (saved) {
      setApiKeys(JSON.parse(saved));
    }
  };

  const saveApiKeys = async () => {
    setSaving(true);
    try {
      localStorage.setItem('webcrafter_api_keys', JSON.stringify(apiKeys));
      toast({
        title: "Settings Saved",
        description: "Your API keys have been saved securely.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save API keys.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateApiKey = (provider: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [provider]: value }));
  };

  const toggleVisibility = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider as keyof typeof prev] }));
  };

  const hasAtLeastOneKey = Object.values(apiKeys).some(key => key.trim() !== "");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <HamburgerMenu />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg"></div>
                <span className="text-xl font-bold">WebCrafter Settings</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">API Keys Configuration</h1>
          <p className="text-muted-foreground">
            Configure your AI API keys to enable project generation. At least one API key is required.
          </p>
          {!hasAtLeastOneKey && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                ⚠️ At least one API key is required to create projects
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <ApiKeyInput
            provider="OpenRouter"
            value={apiKeys.openrouter}
            onChange={(value) => updateApiKey("openrouter", value)}
            isVisible={showKeys.openrouter}
            onToggleVisibility={() => toggleVisibility("openrouter")}
            placeholder="sk-or-v1-..."
            helpUrl="https://openrouter.ai/keys"
          />

          <ApiKeyInput
            provider="OpenAI"
            value={apiKeys.openai}
            onChange={(value) => updateApiKey("openai", value)}
            isVisible={showKeys.openai}
            onToggleVisibility={() => toggleVisibility("openai")}
            placeholder="sk-..."
            helpUrl="https://platform.openai.com/api-keys"
          />

          <ApiKeyInput
            provider="DeepSeek"
            value={apiKeys.deepseek}
            onChange={(value) => updateApiKey("deepseek", value)}
            isVisible={showKeys.deepseek}
            onToggleVisibility={() => toggleVisibility("deepseek")}
            placeholder="sk-..."
            helpUrl="https://platform.deepseek.com/api_keys"
          />

          <ApiKeyInput
            provider="Gemini"
            value={apiKeys.gemini}
            onChange={(value) => updateApiKey("gemini", value)}
            isVisible={showKeys.gemini}
            onToggleVisibility={() => toggleVisibility("gemini")}
            placeholder="AIza..."
            helpUrl="https://aistudio.google.com/app/apikey"
          />

          <ApiKeyInput
            provider="Anthropic"
            value={apiKeys.anthropic}
            onChange={(value) => updateApiKey("anthropic", value)}
            isVisible={showKeys.anthropic}
            onToggleVisibility={() => toggleVisibility("anthropic")}
            placeholder="sk-ant-..."
            helpUrl="https://console.anthropic.com/"
          />

          <Button onClick={saveApiKeys} disabled={saving} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Settings;