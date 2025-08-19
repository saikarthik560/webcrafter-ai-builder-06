import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Play, Pause, Copy, Check } from "lucide-react";

interface Animation {
  name: string;
  description: string;
  category: string;
  cssCode: string;
  preview: string;
  usage: string;
}

interface EnhancedAnimationCatalogProps {
  selectedAnimations: string[];
  onToggleAnimation: (animation: string) => void;
}

const animationCategories = {
  "entrance": {
    title: "Entrance Effects",
    description: "Eye-catching entrance animations",
    animations: [
      {
        name: "Fade In Up",
        description: "Elements fade in while sliding up",
        category: "entrance",
        preview: "fade-in-up-demo",
        usage: "Headers, cards, sections",
        cssCode: `@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
.fade-in-up { animation: fadeInUp 0.8s ease-out; }`
      },
      {
        name: "Scale In",
        description: "Elements scale in from small to normal size",
        category: "entrance", 
        preview: "scale-in-demo",
        usage: "Buttons, modals, icons",
        cssCode: `@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.5); }
  to { opacity: 1; transform: scale(1); }
}
.scale-in { animation: scaleIn 0.6s ease-out; }`
      },
      {
        name: "Slide In Left",
        description: "Elements slide in from the left side",
        category: "entrance",
        preview: "slide-in-left-demo", 
        usage: "Navigation, sidebars, content",
        cssCode: `@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-100px); }
  to { opacity: 1; transform: translateX(0); }
}
.slide-in-left { animation: slideInLeft 0.8s ease-out; }`
      }
    ]
  },
  "hover": {
    title: "Hover Effects",
    description: "Interactive hover animations",
    animations: [
      {
        name: "Hover Lift",
        description: "Element lifts up on hover with shadow",
        category: "hover",
        preview: "hover-lift-demo",
        usage: "Cards, buttons, images",
        cssCode: `.hover-lift {
  transition: all 0.3s ease;
  transform: translateY(0);
}
.hover-lift:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}`
      },
      {
        name: "Hover Glow",
        description: "Glowing effect on hover",
        category: "hover",
        preview: "hover-glow-demo",
        usage: "Buttons, links, call-to-actions",
        cssCode: `.hover-glow {
  transition: all 0.3s ease;
}
.hover-glow:hover {
  box-shadow: 0 0 20px rgba(74, 144, 226, 0.6);
  transform: scale(1.02);
}`
      },
      {
        name: "Hover Tilt",
        description: "3D tilt effect on hover",
        category: "hover", 
        preview: "hover-tilt-demo",
        usage: "Cards, product items, portfolio pieces",
        cssCode: `.hover-tilt {
  transition: transform 0.3s ease;
}
.hover-tilt:hover {
  transform: perspective(1000px) rotateX(10deg) rotateY(10deg);
}`
      }
    ]
  },
  "loading": {
    title: "Loading Animations",
    description: "Engaging loading states",
    animations: [
      {
        name: "Pulse Loader",
        description: "Pulsing circle loader",
        category: "loading",
        preview: "pulse-loader-demo",
        usage: "Loading states, placeholders",
        cssCode: `@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.1); }
}
.pulse-loader { animation: pulse 2s infinite; }`
      },
      {
        name: "Spinner",
        description: "Rotating spinner loader",
        category: "loading",
        preview: "spinner-demo", 
        usage: "Page loading, form submission",
        cssCode: `@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.spinner { animation: spin 1s linear infinite; }`
      },
      {
        name: "Skeleton Wave",
        description: "Shimmer loading effect",
        category: "loading",
        preview: "skeleton-wave-demo",
        usage: "Content placeholders, data loading",
        cssCode: `@keyframes shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}
.skeleton-wave {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: shimmer 1.5s infinite;
}`
      }
    ]
  },
  "micro": {
    title: "Micro Interactions",
    description: "Subtle interactive animations",
    animations: [
      {
        name: "Button Press",
        description: "Satisfying button press animation",
        category: "micro",
        preview: "button-press-demo",
        usage: "Buttons, clickable elements",
        cssCode: `.button-press:active {
  transform: scale(0.95);
  transition: transform 0.1s ease;
}`
      },
      {
        name: "Elastic Scale",
        description: "Bouncy scale effect",
        category: "micro",
        preview: "elastic-scale-demo", 
        usage: "Icons, interactive elements",
        cssCode: `@keyframes elasticScale {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}
.elastic-scale:hover { animation: elasticScale 0.6s ease; }`
      },
      {
        name: "Wiggle",
        description: "Playful wiggle motion",
        category: "micro",
        preview: "wiggle-demo",
        usage: "Notifications, alerts, fun elements",
        cssCode: `@keyframes wiggle {
  0%, 7% { transform: rotateZ(0); }
  15% { transform: rotateZ(-15deg); }
  20% { transform: rotateZ(10deg); }
  25% { transform: rotateZ(-10deg); }
  30% { transform: rotateZ(6deg); }
  35% { transform: rotateZ(-4deg); }
  40%, 100% { transform: rotateZ(0); }
}
.wiggle:hover { animation: wiggle 0.8s ease; }`
      }
    ]
  },
  "text": {
    title: "Text Animations", 
    description: "Dynamic text effects",
    animations: [
      {
        name: "Typewriter",
        description: "Text typing effect",
        category: "text",
        preview: "typewriter-demo",
        usage: "Headlines, hero text, storytelling",
        cssCode: `@keyframes typewriter {
  from { width: 0; }
  to { width: 100%; }
}
.typewriter {
  overflow: hidden;
  border-right: 2px solid;
  white-space: nowrap;
  animation: typewriter 3s steps(40, end);
}`
      },
      {
        name: "Text Reveal",
        description: "Text reveals from behind a mask",
        category: "text",
        preview: "text-reveal-demo",
        usage: "Headlines, quotes, emphasis",
        cssCode: `@keyframes textReveal {
  0% { clip-path: inset(0 100% 0 0); }
  100% { clip-path: inset(0 0 0 0); }
}
.text-reveal { animation: textReveal 1.2s ease-out; }`
      },
      {
        name: "Gradient Text",
        description: "Animated gradient text effect",
        category: "text",
        preview: "gradient-text-demo",
        usage: "Headings, brand text, CTAs",
        cssCode: `@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.gradient-text {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientShift 3s ease infinite;
}`
      }
    ]
  },
  "background": {
    title: "Background Effects",
    description: "Animated background patterns",
    animations: [
      {
        name: "Floating Particles",
        description: "Floating particle background",
        category: "background",
        preview: "particles-demo",
        usage: "Hero sections, full-screen backgrounds",
        cssCode: `@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}
.particle {
  animation: float 6s ease-in-out infinite;
  animation-delay: var(--delay);
}`
      },
      {
        name: "Gradient Waves",
        description: "Flowing gradient wave animation",
        category: "background",
        preview: "waves-demo",
        usage: "Section backgrounds, hero areas",
        cssCode: `@keyframes waveFlow {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.gradient-waves {
  background: linear-gradient(45deg, transparent, rgba(74, 144, 226, 0.3), transparent);
  animation: waveFlow 8s linear infinite;
}`
      },
      {
        name: "Mesh Gradient",
        description: "Dynamic mesh gradient background",
        category: "background",
        preview: "mesh-demo",
        usage: "Modern backgrounds, hero sections",
        cssCode: `@keyframes meshMove {
  0%, 100% { transform: scale(1) rotate(0deg); }
  33% { transform: scale(1.1) rotate(120deg); }
  66% { transform: scale(0.9) rotate(240deg); }
}
.mesh-gradient {
  background: radial-gradient(circle at 20% 50%, #ff6b6b 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, #4ecdc4 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, #45b7d1 0%, transparent 50%);
  animation: meshMove 10s ease-in-out infinite;
}`
      }
    ]
  }
};

const EnhancedAnimationCatalog = ({ selectedAnimations, onToggleAnimation }: EnhancedAnimationCatalogProps) => {
  const [activeCategory, setActiveCategory] = useState("entrance");
  const [previewingAnimation, setPreviewingAnimation] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (code: string, animationName: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(animationName);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const togglePreview = (animationName: string) => {
    setPreviewingAnimation(previewingAnimation === animationName ? null : animationName);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Animation Catalog
        </h2>
        <p className="text-muted-foreground">
          Choose from our curated collection of modern animations and effects
        </p>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-8">
          {Object.entries(animationCategories).map(([key, category]) => (
            <TabsTrigger key={key} value={key} className="text-xs">
              {category.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(animationCategories).map(([categoryKey, category]) => (
          <TabsContent key={categoryKey} value={categoryKey}>
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
              <p className="text-muted-foreground">{category.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.animations.map((animation) => (
                <Card key={animation.name} className="relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedAnimations.includes(animation.name)}
                          onCheckedChange={() => onToggleAnimation(animation.name)}
                        />
                        <CardTitle className="text-lg">{animation.name}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {animation.usage}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{animation.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Live Preview Area */}
                    <div className="bg-muted/20 rounded-lg p-6 flex items-center justify-center h-24 relative overflow-hidden">
                      <style>
                        {`
                          .fade-in-up-demo { animation: previewFadeInUp 2s ease-out infinite; }
                          .scale-in-demo { animation: previewScaleIn 2s ease-out infinite; }
                          .slide-in-left-demo { animation: previewSlideInLeft 2s ease-out infinite; }
                          .hover-lift-demo { animation: previewHoverLift 2s ease-in-out infinite; }
                          .hover-glow-demo { animation: previewHoverGlow 2s ease-in-out infinite; }
                          .hover-tilt-demo { animation: previewHoverTilt 2s ease-in-out infinite; }
                          .pulse-loader-demo { animation: previewPulseLoader 1.5s ease-in-out infinite; }
                          .spinner-demo { animation: previewSpinner 1s linear infinite; }
                          .skeleton-wave-demo { animation: previewSkeletonWave 1.5s ease-in-out infinite; }
                          .button-press-demo { animation: previewButtonPress 2s ease-in-out infinite; }
                          .elastic-scale-demo { animation: previewElasticScale 2s ease-in-out infinite; }
                          .wiggle-demo { animation: previewWiggle 2s ease-in-out infinite; }
                          .typewriter-demo { animation: previewTypewriter 3s ease-in-out infinite; }
                          .text-reveal-demo { animation: previewTextReveal 2s ease-in-out infinite; }
                          .gradient-text-demo { animation: previewGradientText 3s ease-in-out infinite; }
                          .particles-demo { animation: previewParticles 4s ease-in-out infinite; }
                          .waves-demo { animation: previewWaves 3s ease-in-out infinite; }
                          .mesh-demo { animation: previewMesh 5s ease-in-out infinite; }
                          
                          @keyframes previewFadeInUp { 0%, 100% { opacity: 0.3; transform: translateY(10px); } 50% { opacity: 1; transform: translateY(0); } }
                          @keyframes previewScaleIn { 0%, 100% { opacity: 0.5; transform: scale(0.5); } 50% { opacity: 1; transform: scale(1); } }
                          @keyframes previewSlideInLeft { 0% { transform: translateX(-30px); opacity: 0.5; } 50% { transform: translateX(0); opacity: 1; } 100% { transform: translateX(30px); opacity: 0.5; } }
                          @keyframes previewHoverLift { 0%, 100% { transform: translateY(0); box-shadow: 0 2px 4px rgba(0,0,0,0.1); } 50% { transform: translateY(-8px); box-shadow: 0 8px 16px rgba(0,0,0,0.2); } }
                          @keyframes previewHoverGlow { 0%, 100% { box-shadow: 0 0 0 rgba(74, 144, 226, 0); } 50% { box-shadow: 0 0 20px rgba(74, 144, 226, 0.6); } }
                          @keyframes previewHoverTilt { 0%, 100% { transform: perspective(1000px) rotateX(0deg) rotateY(0deg); } 50% { transform: perspective(1000px) rotateX(10deg) rotateY(10deg); } }
                          @keyframes previewPulseLoader { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.1); } }
                          @keyframes previewSpinner { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                          @keyframes previewSkeletonWave { 0% { background-position: -200px 0; } 100% { background-position: calc(200px + 100%) 0; } }
                          @keyframes previewButtonPress { 0%, 80%, 100% { transform: scale(1); } 10% { transform: scale(0.95); } }
                          @keyframes previewElasticScale { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.3); } }
                          @keyframes previewWiggle { 0%, 7%, 100% { transform: rotateZ(0); } 15% { transform: rotateZ(-15deg); } 20% { transform: rotateZ(10deg); } 25% { transform: rotateZ(-10deg); } 30% { transform: rotateZ(6deg); } 35% { transform: rotateZ(-4deg); } 40% { transform: rotateZ(0); } }
                          @keyframes previewTypewriter { 0%, 100% { width: 20%; } 50% { width: 80%; } }
                          @keyframes previewTextReveal { 0% { clip-path: inset(0 100% 0 0); } 50% { clip-path: inset(0 0 0 0); } 100% { clip-path: inset(0 100% 0 0); } }
                          @keyframes previewGradientText { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
                          @keyframes previewParticles { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
                          @keyframes previewWaves { 0% { transform: translateX(-20px); } 50% { transform: translateX(0); } 100% { transform: translateX(20px); } }
                          @keyframes previewMesh { 0%, 100% { transform: scale(1) rotate(0deg); } 33% { transform: scale(1.1) rotate(60deg); } 66% { transform: scale(0.9) rotate(120deg); } }
                        `}
                      </style>
                      <div 
                        className={`w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold transition-all duration-300 ${
                          previewingAnimation === animation.name ? animation.preview : ''
                        }`}
                      >
                        ✨
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePreview(animation.name)}
                        className="flex-1"
                      >
                        {previewingAnimation === animation.name ? (
                          <><Pause className="w-4 h-4 mr-1" /> Pause</>
                        ) : (
                          <><Play className="w-4 h-4 mr-1" /> Preview</>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(animation.cssCode, animation.name)}
                      >
                        {copiedCode === animation.name ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    {/* CSS Code Preview */}
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                        View CSS Code
                      </summary>
                      <pre className="mt-2 p-3 bg-muted/50 rounded text-xs overflow-auto max-h-32 font-mono">
                        <code>{animation.cssCode}</code>
                      </pre>
                    </details>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Summary */}
      {selectedAnimations.length > 0 && (
        <Card className="mt-8 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Selected Animations ({selectedAnimations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedAnimations.map((animation) => (
                <Badge key={animation} variant="default" className="cursor-pointer" onClick={() => onToggleAnimation(animation)}>
                  {animation} ✕
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedAnimationCatalog;