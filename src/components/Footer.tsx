import NewsletterSignup from "./NewsletterSignup";

const Footer = () => {
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
            <h3 className="text-xl font-semibold text-white mb-4">About Us</h3>
            <p className="text-white/70 mb-6">
              Discover the universe's finest collection of celestial merchandise.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;