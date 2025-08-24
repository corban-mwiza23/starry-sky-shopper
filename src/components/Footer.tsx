
// You can either import the logo locally:
// import logoImage from "@/assets/logo.png";
// Or use the URL directly as done below

const Footer = () => {
  // Logo can be either imported locally or used as URL
  const logoSrc = "/lovable-uploads/81b3af56-15f1-4535-8e61-b2a94a4afd4e.png";
  // Alternative: const logoSrc = logoImage; // if imported locally

  return (
    <footer className="mt-20 bg-[#121212] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center mb-8">
          <img 
            src={logoSrc}
            alt="PLUGG'IN Logo" 
            className="h-16 w-auto"
          />
        </div>
        
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col items-center justify-center space-y-4">
                         <div className="text-center space-y-2 font-miralone text-sm text-white/80">
               <p>Copyright © 2024, <span className="font-revans text-white/90">PLUGG'IN</span></p>
               <p>Theme By PLUGG'IN Designs</p>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
