import { useState, useEffect } from "react";
import ProductGrid from "@/components/ProductGrid";
import Cart from "@/components/Cart";

const Index = () => {
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const video = document.getElementById("bgVideo") as HTMLVideoElement;
    if (video) {
      video.play().catch((error) => {
        console.log("Video autoplay failed:", error);
      });
    }
  }, []);

  const handleAddToCart = (productId: number) => {
    console.log("Added product to cart:", productId);
    // Implement cart logic here
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Video */}
      <div className="fixed inset-0 -z-10">
        <video
          id="bgVideo"
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          className="w-full h-full object-cover"
        >
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-cosmic-dark/50 backdrop-blur-xs" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Cart />
        <div className="container mx-auto pt-20">
          <h1 className="text-4xl md:text-6xl font-bold text-white text-center mb-12 animate-fade-in">
            Cosmic Collection
          </h1>
          <ProductGrid onAddToCart={handleAddToCart} />
        </div>
      </div>
    </div>
  );
};

export default Index;