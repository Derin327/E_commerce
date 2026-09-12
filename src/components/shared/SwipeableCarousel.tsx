import { ReactNode } from "react";

export default function SwipeableCarousel({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <div className="w-full py-8">
      {title && (
        <h2 className="text-xl md:text-2xl font-semibold text-center mb-8 tracking-wide">
          {title}
        </h2>
      )}
      <div className="w-full relative">
        <div className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory gap-4 px-4 pb-4 no-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
