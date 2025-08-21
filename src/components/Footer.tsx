
import NewsletterSignup from "./NewsletterSignup";
// You can either import the logo locally:
// import logoImage from "@/assets/logo.png";
// Or use the URL directly as done below

const Footer = () => {
  // Logo can be either imported locally or used as URL
  const logoSrc = "/lovable-uploads/761c3dec-7031-4392-b6d8-70525efd46e2.png";
  // Alternative: const logoSrc = logoImage; // if imported locally

  return (
    <footer className="mt-20 bg-[#121212] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center mb-8">
          <img 
            src={logoSrc}
            alt="Millicado Logo" 
            className="h-16 w-auto"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Company Address */}
          <div className="space-y-4">
            <h3 className="text-xl font-miralone mb-4">Visit Us</h3>
            <address className="font-miralone text-white/80 not-italic">
              <p>Millicado Store</p>
              <p>123 Fashion Street</p>
              <p>London, UK</p>
              <p>EC1A 1BB</p>
            </address>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-xl font-miralone mb-4">Contact</h3>
            <div className="font-miralone text-white/80">
              <p>Phone: +44 20 1234 5678</p>
              <p>Email: info@millicado.com</p>
              <p>Hours: Mon-Fri 9am-6pm</p>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="text-center md:text-left">
            <h3 className="text-xl font-miralone mb-4">Sign up for updates</h3>
            <p className="text-white/80 font-miralone text-sm mb-4">
              Subscribe to receive updates about new products and special offers.
            </p>
            <NewsletterSignup />
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="text-center space-y-2 font-miralone text-sm text-white/80">
              <p>Copyright © 2024, <span className="font-revans text-white/90">MILLICADO</span></p>
              <p>Theme By Millicado Designs</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
