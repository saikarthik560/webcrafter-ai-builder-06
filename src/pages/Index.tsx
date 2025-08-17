import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import CTASection from "@/components/sections/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen relative">
      {/* Spline Background for Home Page */}
      <div className="fixed inset-0 z-0">
        <iframe 
          src='https://my.spline.design/claritystream-HO2NJbsg4PBsB0dCXzScasfo/' 
          frameBorder='0' 
          width='100%' 
          height='100%'
          className="pointer-events-none"
        />
      </div>
      
      {/* Content with backdrop */}
      <div className="relative z-10 bg-background/80 backdrop-blur-sm">
        <Header />
        <main>
          <HeroSection />
          <FeaturesSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Index;
