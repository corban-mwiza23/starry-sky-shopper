import NewsletterSignup from "./NewsletterSignup";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="mt-20 border-t border-white/10 bg-[#1A1F2C]/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-semibold text-white mb-4">Stay Updated</h3>
            <p className="text-white/70 mb-6">
              Subscribe to our newsletter for the latest products and cosmic deals!
            </p>
            <NewsletterSignup />
          </div>
          <div className="text-center md:text-right">
            <h3 className="text-xl font-semibold text-white mb-4">Your Account</h3>
            <p className="text-white/70 mb-6">
              Sign in to view your order history and track your deliveries.
            </p>
            <Button
              onClick={() => navigate("/login")}
              className="bg-white/20 hover:bg-white/30 text-white"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;