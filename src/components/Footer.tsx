import NewsletterSignup from "./NewsletterSignup";

const Footer = () => {
  return (
    <footer className="mt-20 bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center space-y-8">
          <div className="text-center max-w-md">
            <h3 className="text-xl font-mono mb-4">Sign up for updates</h3>
            <NewsletterSignup />
          </div>
          
          <div className="flex items-center justify-center mt-8">
            <img 
              src="/lovable-uploads/0116fb29-5a66-4eaf-8090-11a0bed3adba.png" 
              alt="PayPal" 
              className="h-8 w-auto"
            />
          </div>
          
          <div className="text-center space-y-2 font-mono text-sm text-white/80">
            <p>Copyright © 2024, ADAMS THEME</p>
            <p>Theme By Adam's Mockups</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;