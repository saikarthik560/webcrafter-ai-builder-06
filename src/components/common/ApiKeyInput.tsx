import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, ExternalLink, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface ApiKeyInputProps {
  provider: string;
  value: string;
  onChange: (value: string) => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
  placeholder: string;
  helpUrl: string;
}

const modelsByProvider: Record<string, { name: string; type: 'free' | 'paid'; description: string }[]> = {
  openai: [
    { name: "gpt-4.1-2025-04-14", type: "paid", description: "Latest flagship model with superior reasoning" },
    { name: "o3-2025-04-16", type: "paid", description: "Advanced reasoning model for complex tasks" },
    { name: "o4-mini-2025-04-16", type: "paid", description: "Fast reasoning model, optimized performance" },
    { name: "gpt-4o-mini", type: "paid", description: "Efficient model for most tasks" },
    { name: "gpt-4o", type: "paid", description: "Powerful multimodal model with vision capabilities" },
    { name: "gpt-4-turbo", type: "paid", description: "Latest GPT-4 with improved speed" },
    { name: "gpt-3.5-turbo", type: "paid", description: "Fast and cost-effective model" },
  ],
  anthropic: [
    { name: "claude-opus-4-20250514", type: "paid", description: "Most capable and intelligent model" },
    { name: "claude-sonnet-4-20250514", type: "paid", description: "High-performance model with excellent reasoning" },
    { name: "claude-3-5-haiku-20241022", type: "paid", description: "Fastest model for quick responses" },
    { name: "claude-3-5-sonnet-20241022", type: "paid", description: "Previous intelligent model" },
    { name: "claude-3-opus-20240229", type: "paid", description: "Powerful but older model" },
    { name: "claude-3-sonnet-20240229", type: "paid", description: "Balanced performance model" },
    { name: "claude-3-haiku-20240307", type: "paid", description: "Fast and efficient model" },
  ],
  openrouter: [
    { name: "meta-llama/llama-3.2-1b-instruct:free", type: "free", description: "Free lightweight Llama model" },
    { name: "meta-llama/llama-3.2-3b-instruct:free", type: "free", description: "Free medium Llama model" },
    { name: "meta-llama/llama-3.1-8b-instruct:free", type: "free", description: "Free large Llama model" },
    { name: "microsoft/phi-3-mini-128k-instruct:free", type: "free", description: "Free Microsoft Phi model" },
    { name: "google/gemma-2-9b-it:free", type: "free", description: "Free Google Gemma model" },
    { name: "mistralai/mistral-7b-instruct:free", type: "free", description: "Free Mistral model" },
    { name: "gpt-4o", type: "paid", description: "OpenAI GPT-4o via OpenRouter" },
    { name: "gpt-4o-mini", type: "paid", description: "OpenAI GPT-4o Mini via OpenRouter" },
    { name: "claude-3-opus", type: "paid", description: "Anthropic Claude Opus via OpenRouter" },
    { name: "claude-3-sonnet", type: "paid", description: "Anthropic Claude Sonnet via OpenRouter" },
    { name: "claude-3-haiku", type: "paid", description: "Anthropic Claude Haiku via OpenRouter" },
    { name: "gemini-pro", type: "paid", description: "Google Gemini Pro via OpenRouter" },
    { name: "meta-llama/llama-3.1-70b-instruct", type: "paid", description: "Large Llama model via OpenRouter" },
    { name: "meta-llama/llama-3.1-405b-instruct", type: "paid", description: "Largest Llama model via OpenRouter" },
    { name: "anthropic/claude-3.5-sonnet", type: "paid", description: "Latest Claude Sonnet via OpenRouter" },
    { name: "openai/gpt-4-turbo", type: "paid", description: "GPT-4 Turbo via OpenRouter" },
    { name: "google/gemini-flash-1.5", type: "paid", description: "Gemini Flash via OpenRouter" },
    { name: "mistralai/mistral-large", type: "paid", description: "Mistral Large via OpenRouter" },
    { name: "cohere/command-r-plus", type: "paid", description: "Cohere Command R+ via OpenRouter" },
    { name: "perplexity/llama-3.1-sonar-large", type: "paid", description: "Perplexity Sonar via OpenRouter" },
  ],
  deepseek: [
    { name: "deepseek-chat", type: "paid", description: "DeepSeek's main chat model for conversations" },
    { name: "deepseek-coder", type: "paid", description: "Specialized model for coding and programming" },
    { name: "deepseek-math", type: "paid", description: "Specialized model for mathematical reasoning" },
    { name: "deepseek-reasoning", type: "paid", description: "Advanced reasoning and problem-solving model" },
  ],
  gemini: [
    { name: "gemini-1.5-pro", type: "paid", description: "Google's most capable multimodal model" },
    { name: "gemini-1.5-flash", type: "paid", description: "Fast and efficient multimodal model" },
    { name: "gemini-pro", type: "paid", description: "Balanced performance model for general use" },
    { name: "gemini-pro-vision", type: "paid", description: "Gemini with enhanced vision capabilities" },
    { name: "gemini-ultra", type: "paid", description: "Most powerful Gemini model (limited availability)" },
  ],
  perplexity: [
    { name: "llama-3.1-sonar-small-128k-online", type: "paid", description: "Small online search model" },
    { name: "llama-3.1-sonar-large-128k-online", type: "paid", description: "Large online search model" },
    { name: "llama-3.1-sonar-huge-128k-online", type: "paid", description: "Huge online search model" },
    { name: "llama-3.1-8b-instruct", type: "paid", description: "Llama instruct model" },
    { name: "llama-3.1-70b-instruct", type: "paid", description: "Large Llama instruct model" },
  ],
  cohere: [
    { name: "command", type: "paid", description: "Cohere's flagship generative model" },
    { name: "command-light", type: "paid", description: "Lighter version of Command model" },
    { name: "command-nightly", type: "paid", description: "Latest experimental Command model" },
    { name: "command-r", type: "paid", description: "Retrieval-augmented generation model" },
    { name: "command-r-plus", type: "paid", description: "Enhanced RAG model with better performance" },
  ],
};

const ApiKeyInput = ({
  provider,
  value,
  onChange,
  isVisible,
  onToggleVisibility,
  placeholder,
  helpUrl,
}: ApiKeyInputProps) => {
  const [isValidating, setIsValidating] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [showModels, setShowModels] = useState(false);

  const models = modelsByProvider[provider.toLowerCase()] || [];

  // Validate API key when it changes
  useEffect(() => {
    if (value && value.length > 10) {
      setIsValidating(true);
      // Simulate API validation
      setTimeout(() => {
        setIsValidating(false);
        setShowModels(true);
      }, 1000);
    } else {
      setShowModels(false);
    }
  }, [value]);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={provider} className="text-sm font-medium">
            {provider} API Key
          </Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(helpUrl, '_blank')}
            className="h-auto p-1 text-xs text-muted-foreground hover:text-primary"
          >
            Get API Key <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </div>
        
        <div className="relative">
          <Input
            id={provider}
            type={isVisible ? "text" : "password"}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pr-10"
          />
          <button
            type="button"
            onClick={onToggleVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          
          {isValidating && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          )}
        </div>
      </div>

      {/* Model Selection */}
      {showModels && models.length > 0 && (
        <Card className="p-4 space-y-3 bg-muted/10">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Available Models</Label>
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-xs">
                {models.filter(m => m.type === 'free').length} Free
              </Badge>
              <Badge variant="outline" className="text-xs">
                {models.filter(m => m.type === 'paid').length} Paid
              </Badge>
            </div>
          </div>
          
          <div className="grid gap-2 max-h-48 overflow-y-auto">
            {models.map((model) => (
              <div
                key={model.name}
                onClick={() => setSelectedModel(model.name)}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedModel === model.name
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-mono text-sm font-medium">{model.name}</div>
                  <Badge variant={model.type === 'free' ? 'secondary' : 'outline'} className="text-xs">
                    {model.type}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">{model.description}</div>
              </div>
            ))}
          </div>
          
          {selectedModel && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
              <div className="text-sm font-medium text-primary">Selected Model</div>
              <div className="font-mono text-sm">{selectedModel}</div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default ApiKeyInput;