"use client";

import { Star } from "lucide-react";

export default function Testimonials() {
  const reviews = [
    {
      id: 1,
      name: "RAJESH",
      city: "Pondicherry",
      text: "Whether it's for everyday wear or a special occasion, GORA has the perfect outfit. The clothing is stylish, comfortable, and versatile.",
    },
    {
      id: 2,
      name: "SANTHOSH",
      city: "Chennai",
      text: "Shopping with GORA is always a great experience. Their collections are modern, easy to wear, and flattering. I love how confident their clothes make me feel.",
    },
    {
      id: 3,
      name: "SELVAKUMAR",
      city: "Coimbatore",
      text: "I love my GORA hoodie. It is soft, warm, and makes me feel cozy all day.",
    },
    {
      id: 4,
      name: "ARAVIND",
      city: "Bangalore",
      text: "I ordered a few shirts online. It arrived fast and fits perfectly. Excellent quality and service!",
    },
  ];

  // Duplicate for infinite scroll
  const scrollItems = [...reviews, ...reviews];

  return (
    <div className="w-full py-20 bg-white overflow-hidden">
      <h2 className="text-3xl md:text-4xl font-medium text-center mb-16 text-black uppercase tracking-widest">
        HAPPY CUSTOMERS, REAL REVIEWS
      </h2>
      
      <div className="relative flex overflow-x-hidden group">
        <div className="flex animate-marquee group-hover:[animation-play-state:paused] whitespace-nowrap">
          {scrollItems.map((review, idx) => (
            <div key={`${review.id}-${idx}`} className="w-[350px] md:w-[450px] px-8 flex-shrink-0 whitespace-normal flex flex-col items-center text-center">
              <div className="flex gap-1 mb-6 text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-8 leading-relaxed font-medium">
                "{review.text}"
              </p>
              <div>
                <h4 className="font-bold text-black tracking-widest uppercase text-sm mb-1">{review.name}</h4>
                <p className="text-gray-500 text-sm">{review.city}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
