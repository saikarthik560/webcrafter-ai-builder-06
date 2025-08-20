import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Play, Pause, Code, GamepadIcon, Palette, Zap, Layers, Mouse, Eye } from "lucide-react";
import CodePopup from "./CodePopup";

interface Animation {
  name: string;
  description: string;
  category: string;
  cssCode: string;
  preview: string;
  usage: string;
  type: 'animation' | 'effect';
}

interface EnhancedAnimationCatalogProps {
  selectedAnimations: string[];
  onToggleAnimation: (animation: string) => void;
}

const animationCategories = {
  "basic": {
    title: "Basic Animations",
    description: "Simple animations for general use",
    icon: Sparkles,
    animations: [
      {
        name: "Fade In",
        description: "Fades in an element",
        category: "basic",
        preview: "fade-in-demo",
        usage: "General elements",
        type: 'animation' as const,
        cssCode: `@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.fade-in { animation: fadeIn 0.5s ease-out; }`
      },
      {
        name: "Slide Up",
        description: "Slides an element up",
        category: "basic",
        preview: "slide-up-demo",
        usage: "Headers, footers",
        type: 'animation' as const,
        cssCode: `@keyframes slideUp {
  from { transform: translateY(50px); }
  to { transform: translateY(0); }
}
.slide-up { animation: slideUp 0.5s ease-out; }`
      },
      {
        name: "Rotate",
        description: "Rotates an element",
        category: "basic",
        preview: "rotate-demo",
        usage: "Icons, buttons",
        type: 'animation' as const,
        cssCode: `@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.rotate { animation: rotate 2s linear infinite; }`
      },
      {
        name: "Zoom In",
        description: "Zooms in an element",
        category: "basic",
        preview: "zoom-in-demo",
        usage: "Images, modals",
        type: 'animation' as const,
        cssCode: `@keyframes zoomIn {
  from { transform: scale(0); }
  to { transform: scale(1); }
}
.zoom-in { animation: zoomIn 0.3s ease-out; }`
      }
    ]
  },
  "entrance": {
    title: "Entrance Effects",
    description: "Eye-catching entrance animations",
    icon: Eye,
    animations: [
      {
        name: "Fade In Up",
        description: "Elements fade in while sliding up",
        category: "entrance",
        preview: "fade-in-up-demo",
        usage: "Headers, cards, sections",
        type: 'animation' as const,
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
        type: 'animation' as const,
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
        type: 'animation' as const,
        cssCode: `@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-100px); }
  to { opacity: 1; transform: translateX(0); }
}
.slide-in-left { animation: slideInLeft 0.8s ease-out; }`
      },
      {
        name: "Bounce In",
        description: "Bouncy entrance animation",
        category: "entrance",
        preview: "bounce-in-demo",
        usage: "Call-to-actions, important elements",
        type: 'animation' as const,
        cssCode: `@keyframes bounceIn {
  0%, 20%, 40%, 60%, 80%, 100% { animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000); }
  0% { opacity: 0; transform: scale3d(.3, .3, .3); }
  20% { transform: scale3d(1.1, 1.1, 1.1); }
  40% { transform: scale3d(.9, .9, .9); }
  60% { opacity: 1; transform: scale3d(1.03, 1.03, 1.03); }
  80% { transform: scale3d(.97, .97, .97); }
  100% { opacity: 1; transform: scale3d(1, 1, 1); }
}
.bounce-in { animation: bounceIn 1s; }`
      }
    ]
  },
  "hover": {
    title: "Hover Effects",
    description: "Interactive hover animations",
    icon: Mouse,
    animations: [
      {
        name: "Hover Lift",
        description: "Element lifts up on hover with shadow",
        category: "hover",
        preview: "hover-lift-demo",
        usage: "Cards, buttons, images",
        type: 'effect' as const,
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
        type: 'effect' as const,
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
        type: 'effect' as const,
        cssCode: `.hover-tilt {
  transition: transform 0.3s ease;
}
.hover-tilt:hover {
  transform: perspective(1000px) rotateX(10deg) rotateY(10deg);
}`
      },
      {
        name: "Hover Zoom",
        description: "Smooth zoom effect on hover",
        category: "hover",
        preview: "hover-zoom-demo",
        usage: "Images, thumbnails, gallery items",
        type: 'effect' as const,
        cssCode: `.hover-zoom {
  transition: transform 0.3s ease;
  overflow: hidden;
}
.hover-zoom:hover {
  transform: scale(1.1);
}`
      }
    ]
  },
  "gaming": {
    title: "Gaming Effects",
    description: "Game-style animations and effects",
    icon: GamepadIcon,
    animations: [
      {
        name: "Health Bar",
        description: "Animated health/progress bar",
        category: "gaming",
        preview: "health-bar-demo",
        usage: "Game UIs, progress indicators",
        type: 'animation' as const,
        cssCode: `@keyframes healthFill {
  from { width: 0%; }
  to { width: 100%; }
}
.health-bar {
  background: linear-gradient(90deg, #ff4444, #ffaa00, #44ff44);
  animation: healthFill 2s ease-out;
  height: 20px;
  border-radius: 10px;
}`
      },
      {
        name: "XP Gain",
        description: "Experience point gain animation",
        category: "gaming",
        preview: "xp-gain-demo",
        usage: "Achievement notifications, level ups",
        type: 'animation' as const,
        cssCode: `@keyframes xpGain {
  0% { opacity: 0; transform: translateY(20px) scale(0.8); }
  50% { opacity: 1; transform: translateY(-10px) scale(1.2); }
  100% { opacity: 0; transform: translateY(-30px) scale(1); }
}
.xp-gain {
  animation: xpGain 2s ease-out;
  color: #ffd700;
  font-weight: bold;
}`
      },
      {
        name: "Critical Hit",
        description: "Critical hit flash effect",
        category: "gaming",
        preview: "critical-hit-demo",
        usage: "Game actions, important events",
        type: 'effect' as const,
        cssCode: `@keyframes criticalHit {
  0%, 100% { background-color: transparent; }
  10%, 30%, 50% { background-color: rgba(255, 255, 0, 0.8); }
  20%, 40% { background-color: rgba(255, 0, 0, 0.6); }
}
.critical-hit {
  animation: criticalHit 0.6s ease-in-out;
}`
      },
      {
        name: "Power Up",
        description: "Power-up collection animation",
        category: "gaming",
        preview: "power-up-demo",
        usage: "Collectibles, upgrades, bonuses",
        type: 'animation' as const,
        cssCode: `@keyframes powerUp {
  0% { transform: scale(1) rotate(0deg); filter: brightness(1); }
  25% { transform: scale(1.3) rotate(90deg); filter: brightness(1.5); }
  50% { transform: scale(1.5) rotate(180deg); filter: brightness(2); }
  75% { transform: scale(1.2) rotate(270deg); filter: brightness(1.5); }
  100% { transform: scale(1) rotate(360deg); filter: brightness(1); }
}
.power-up {
  animation: powerUp 1s ease-in-out;
  background: radial-gradient(circle, #ffd700, #ff6b35);
}`
      }
    ]
  },
  "background": {
    title: "Background Effects",
    description: "Animated background patterns and effects",
    icon: Layers,
    animations: [
      {
        name: "Floating Particles",
        description: "Floating particle background",
        category: "background",
        preview: "particles-demo",
        usage: "Hero sections, full-screen backgrounds",
        type: 'effect' as const,
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
        type: 'effect' as const,
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
        name: "Matrix Rain",
        description: "Matrix-style falling code effect",
        category: "background",
        preview: "matrix-demo",
        usage: "Tech websites, coding themes",
        type: 'effect' as const,
        cssCode: `@keyframes matrixRain {
  0% { transform: translateY(-100vh); opacity: 1; }
  100% { transform: translateY(100vh); opacity: 0; }
}
.matrix-rain {
  animation: matrixRain 3s linear infinite;
  color: #00ff00;
  font-family: monospace;
}`
      },
      {
        name: "Starfield",
        description: "Moving starfield background",
        category: "background",
        preview: "starfield-demo",
        usage: "Space themes, sci-fi websites",
        type: 'effect' as const,
        cssCode: `@keyframes starMove {
  from { transform: translateY(-100vh); }
  to { transform: translateY(100vh); }
}
.star {
  animation: starMove 4s linear infinite;
  background: white;
  border-radius: 50%;
  animation-delay: var(--delay);
}`
      }
    ]
  },
  "loading": {
    title: "Loading Animations",
    description: "Engaging loading states and spinners",
    icon: Zap,
    animations: [
      {
        name: "Pulse Loader",
        description: "Pulsing circle loader",
        category: "loading",
        preview: "pulse-loader-demo",
        usage: "Loading states, placeholders",
        type: 'animation' as const,
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
        type: 'animation' as const,
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
        type: 'animation' as const,
        cssCode: `@keyframes shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}
.skeleton-wave {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: shimmer 1.5s infinite;
}`
      },
      {
        name: "Dots Loader",
        description: "Bouncing dots loader",
        category: "loading",
        preview: "dots-loader-demo",
        usage: "Minimalist loading states",
        type: 'animation' as const,
        cssCode: `@keyframes dotBounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-30px); }
  60% { transform: translateY(-15px); }
}
.dot {
  animation: dotBounce 2s infinite ease-in-out;
  animation-delay: var(--delay);
}`
      }
    ]
  },
  "text": {
    title: "Text Animations", 
    description: "Dynamic text effects and typography",
    icon: Palette,
    animations: [
      {
        name: "Typewriter",
        description: "Text typing effect",
        category: "text",
        preview: "typewriter-demo",
        usage: "Headlines, hero text, storytelling",
        type: 'animation' as const,
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
        type: 'animation' as const,
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
        type: 'effect' as const,
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
      },
      {
        name: "Neon Glow",
        description: "Neon text glow effect",
        category: "text",
        preview: "neon-glow-demo",
        usage: "Retro themes, gaming, nightlife",
        type: 'effect' as const,
        cssCode: `@keyframes neonGlow {
  0%, 100% { text-shadow: 0 0 5px #ff00ff, 0 0 10px #ff00ff, 0 0 15px #ff00ff; }
  50% { text-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff; }
}
.neon-glow {
  animation: neonGlow 2s ease-in-out infinite alternate;
  color: white;
}`
      }
    ]
  }
};

const EnhancedAnimationCatalog = ({ selectedAnimations, onToggleAnimation }: EnhancedAnimationCatalogProps) => {
  const [activeCategory, setActiveCategory] = useState("entrance");
  const [previewingAnimation, setPreviewingAnimation] = useState<string | null>(null);

  const togglePreview = (animationName: string) => {
    setPreviewingAnimation(previewingAnimation === animationName ? null : animationName);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Enhanced Animation Catalog
        </h2>
        <p className="text-muted-foreground">
          Professional animations and effects for modern web applications
        </p>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-8">
          {Object.entries(animationCategories).map(([key, category]) => {
            const IconComponent = category.icon;
            return (
              <TabsTrigger key={key} value={key} className="text-xs flex items-center gap-1">
                <IconComponent className="w-3 h-3" />
                {category.title}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.entries(animationCategories).map(([categoryKey, category]) => (
          <TabsContent key={categoryKey} value={categoryKey}>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <category.icon className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold">{category.title}</h3>
              </div>
              <p className="text-muted-foreground">{category.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.animations.map((animation) => (
                <Card key={animation.name} className="relative overflow-hidden border-border hover:border-primary/30 transition-all duration-300 bg-background/60">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedAnimations.includes(animation.name)}
                          onCheckedChange={() => onToggleAnimation(animation.name)}
                        />
                        <CardTitle className="text-lg">{animation.name}</CardTitle>
                      </div>
                      <div className="flex gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {animation.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {animation.usage.split(',')[0]}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{animation.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Live Preview Area */}
                    <div className="bg-background/40 rounded-lg p-6 flex items-center justify-center h-24 relative overflow-hidden border border-border">
                      <style>
                        {`
                          .${animation.preview} { animation: preview${animation.name.replace(/\s+/g, '')} 2s ease-in-out infinite; }
                          
                          @keyframes previewFadeInUp { 0%, 100% { opacity: 0.3; transform: translateY(10px); } 50% { opacity: 1; transform: translateY(0); } }
                          @keyframes previewScaleIn { 0%, 100% { opacity: 0.5; transform: scale(0.5); } 50% { opacity: 1; transform: scale(1); } }
                          @keyframes previewSlideInLeft { 0% { transform: translateX(-30px); opacity: 0.5; } 50% { transform: translateX(0); opacity: 1; } 100% { transform: translateX(30px); opacity: 0.5; } }
                          @keyframes previewBounceIn { 0%, 100% { transform: scale(0.8); } 50% { transform: scale(1.2); } }
                          @keyframes previewHoverLift { 0%, 100% { transform: translateY(0); box-shadow: 0 2px 4px rgba(0,0,0,0.1); } 50% { transform: translateY(-8px); box-shadow: 0 8px 16px rgba(0,0,0,0.2); } }
                          @keyframes previewHoverGlow { 0%, 100% { box-shadow: 0 0 0 rgba(74, 144, 226, 0); } 50% { box-shadow: 0 0 20px rgba(74, 144, 226, 0.6); } }
                          @keyframes previewHoverTilt { 0%, 100% { transform: perspective(1000px) rotateX(0deg) rotateY(0deg); } 50% { transform: perspective(1000px) rotateX(10deg) rotateY(10deg); } }
                          @keyframes previewHoverZoom { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
                          @keyframes previewHealthBar { 0% { width: 20%; } 100% { width: 100%; } }
                          @keyframes previewXPGain { 0% { opacity: 0; transform: translateY(20px); } 50% { opacity: 1; transform: translateY(-10px); } 100% { opacity: 0; transform: translateY(-30px); } }
                          @keyframes previewCriticalHit { 0%, 100% { background-color: transparent; } 50% { background-color: rgba(255, 255, 0, 0.8); } }
                          @keyframes previewPowerUp { 0%, 100% { transform: scale(1) rotate(0deg); } 50% { transform: scale(1.3) rotate(180deg); } }
                          @keyframes previewParticles { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
                          @keyframes previewWaves { 0% { transform: translateX(-20px); } 50% { transform: translateX(0); } 100% { transform: translateX(20px); } }
                          @keyframes previewMatrix { 0% { transform: translateY(-20px); opacity: 1; } 100% { transform: translateY(20px); opacity: 0; } }
                          @keyframes previewStarfield { 0% { transform: translateY(-20px); } 100% { transform: translateY(20px); } }
                          @keyframes previewPulseLoader { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.1); } }
                          @keyframes previewSpinner { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                          @keyframes previewSkeletonWave { 0% { background-position: -200px 0; } 100% { background-position: calc(200px + 100%) 0; } }
                          @keyframes previewDotsLoader { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                          @keyframes previewTypewriter { 0%, 100% { width: 20%; } 50% { width: 80%; } }
                          @keyframes previewTextReveal { 0% { clip-path: inset(0 100% 0 0); } 50% { clip-path: inset(0 0 0 0); } 100% { clip-path: inset(0 100% 0 0); } }
                          @keyframes previewGradientText { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
                          @keyframes previewNeonGlow { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.5); } }
                        `}
                      </style>
                      <div 
                        className={`w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center text-primary-foreground font-bold transition-all duration-300 ${animation.preview}`}
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
                        className="flex-1 bg-background/20 border-primary/30 hover:bg-primary/20"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {previewingAnimation === animation.name ? 'Hide' : 'Preview'}
                      </Button>
                      
                      <CodePopup animation={animation} />
                    </div>

                    {/* Usage Information */}
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        <strong>Best for:</strong> {animation.usage}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        )))}
      </Tabs>
    </div>
  );
};

export default EnhancedAnimationCatalog;
