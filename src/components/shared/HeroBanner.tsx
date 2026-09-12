import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface HeroConfig {
  heading?: string;
  subheading?: string;
  videoUrl?: string;
  buttonText?: string;
  buttonLink?: string;
}

export default function HeroBanner({ config }: { config?: HeroConfig }) {
  const heading = config?.heading || "Redefine Your Streetwear";
  const subheading = config?.subheading || "Discover the latest Italian and Korean trends with GORA";
  const videoUrl = config?.videoUrl || "https://cdn.coverr.co/videos/coverr-a-man-walking-in-a-forest-83-1080p.mp4";
  const buttonText = config?.buttonText || "Explore Collection";
  const buttonLink = config?.buttonLink || "/shop";

  return (
    <div className="relative w-full h-[80vh] min-h-[600px] overflow-hidden bg-black">
      {/* Video Background */}
      <video
        key={videoUrl}
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover opacity-60"
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl md:text-7xl font-bold tracking-widest uppercase text-white mb-6 drop-shadow-lg max-w-4xl leading-tight">
          {heading}
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mb-10 tracking-widest uppercase max-w-2xl drop-shadow-md">
          {subheading}
        </p>
        <Link 
          href={buttonLink} 
          className="group flex items-center gap-3 bg-white text-black px-10 py-5 text-sm font-bold uppercase tracking-[0.2em] hover:bg-[#e32c2b] hover:text-white transition-all duration-300 shadow-xl"
        >
          {buttonText}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
