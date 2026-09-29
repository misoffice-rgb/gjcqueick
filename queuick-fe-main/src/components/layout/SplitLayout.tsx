import type { ReactNode } from "react";

interface SplitLayoutProps {
  children: ReactNode;
  leftTitle?: ReactNode;
  leftSubtitle?: ReactNode;
}

export const SplitLayout = ({
  children,
  leftTitle = "GOOD DAY!",
  leftSubtitle = "Let's get you queued up.",
}: SplitLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans bg-brand-green">
      {/* Left Column (Branding & Welcome) */}
      <div className="relative w-full md:w-1/2 flex-shrink-0 text-white flex flex-col justify-between overflow-hidden p-4 md:p-12">
        {/* Halftone Dot Pattern Top */}
        <div
          className="absolute top-0 left-0 w-full h-80 opacity-30 pointer-events-none z-0"
          style={{
            backgroundImage:
              "radial-gradient(var(--color-brand-yellow) 3px, transparent 3px)",
            backgroundSize: "24px 24px",
            maskImage:
              "linear-gradient(to bottom right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%)",
            WebkitMaskImage:
              "linear-gradient(to bottom right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%)",
          }}
        />

        {/* Background seal image */}
        <div className="absolute -top-8 right-16 z-0 flex items-center justify-center pointer-events-none">
          <img
            src="/gjc-logo.png"
            alt="GJC Background Seal"
            className="w-full max-w-[350px] object-contain opacity-20 mix-blend-overlay drop-shadow-2xl translate-x-12 translate-y-12"
          />
        </div>

        {/* Yellow Bottom-Left Abstract Shape */}
        <div className="absolute bottom-0 left-0 w-full h-64 pointer-events-none z-10 flex flex-col justify-end">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="w-full h-16 sm:h-32 absolute bottom-0 left-0 fill-white/70  mix-blend-multiply"
          >
            <polygon points="0,50 100,100 0,100" />
          </svg>
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="w-full h-10 sm:h-24 absolute bottom-0 left-0 fill-brand-yellow"
          >
            <polygon points="0,40 100,100 0,100" />
          </svg>
        </div>

        {/* Upward yellow chevrons right side */}
        <div className="hidden absolute right-8 bottom-12 sm:flex flex-col items-center justify-end -space-y-6 z-10 pointer-events-none opacity-90">
          {[...Array(4)].map((_, i) => (
            <svg
              key={i}
              className="size-20 text-brand-yellow drop-shadow-md"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 15l7-7 7 7" />
            </svg>
          ))}
        </div>

        <div className="relative z-20 uppercase">
          <h1
            className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-2 md:mb-4 drop-shadow-lg text-white"
            style={{ textShadow: "2px 3px 0px rgba(0,0,0,0.1)" }}
          >
            {leftTitle}
          </h1>
          <p className="text-lg md:text-2xl font-bold tracking-wide drop-shadow-sm ml-1">
            {leftSubtitle}
          </p>
        </div>

        <div className="relative z-20 mb-4 md:mb-10 ml-1">
          <p className="text-base md:text-xl font-medium italic drop-shadow-sm">
            Your time matters,
            <br />
            Let's keep the line moving.
          </p>
        </div>
      </div>

      {/* Right Column (Children Content) */}
      <div className="w-full md:w-1/2 flex-1 flex flex-col justify-center items-center p-6 md:p-12 lg:p-20 bg-white z-20 shadow-[-15px_0_30px_rgba(0,0,0,0.05)] md:rounded-l-[2.5rem]">
        <div className="w-full max-w-md space-y-6 xl:space-y-8">{children}</div>
      </div>
    </div>
  );
};
