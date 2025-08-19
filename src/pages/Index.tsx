import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import CTASection from "@/components/sections/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Spline Background for Home Page - More Visible */}
      <div className="fixed inset-0 z-0">
        <iframe 
          src='https://my.spline.design/claritystream-HO2NJbsg4PBsB0dCXzScasfo/' 
          frameBorder='0' 
          width='100%' 
          height='100%'
          className="pointer-events-none scale-110"
        />
      </div>
      
      {/* Enhanced Glassmorphism Content */}
      <div className="relative z-10 min-h-screen">
        {/* Glassmorphism Header */}
        <div className="bg-background/20 backdrop-blur-md border-b border-white/10">
          <Header />
        </div>
        
        {/* Main Content with Enhanced Glassmorphism */}
        <main className="bg-gradient-to-br from-background/20 via-background/10 to-background/20 backdrop-blur-lg">
          <div className="bg-gradient-to-br from-white/5 via-transparent to-white/5">
            <HeroSection />
          </div>
          <div className="bg-background/10 backdrop-blur-sm">
            <FeaturesSection />
          </div>
          <div className="bg-gradient-to-br from-white/5 via-transparent to-white/5">
            <CTASection />
          </div>
        </main>
        
        {/* Glassmorphism Footer */}
        <div className="bg-background/20 backdrop-blur-md border-t border-white/10">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Index;
