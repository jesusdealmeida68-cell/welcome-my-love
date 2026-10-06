import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

const SPARKS = [
  { left: "14%", top: "22%", size: 14, delay: "0.2s" },
  { left: "82%", top: "18%", size: 18, delay: "0.7s" },
  { left: "20%", top: "72%", size: 12, delay: "1.1s" },
  { left: "78%", top: "68%", size: 16, delay: "0.4s" },
  { left: "50%", top: "10%", size: 10, delay: "1.4s" },
];

export function SplashScreen({ onDone, duration = 2600 }: { onDone: () => void; duration?: number }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const leave = setTimeout(() => setLeaving(true), duration);
    const done = setTimeout(onDone, duration + 600);
    return () => {
      clearTimeout(leave);
      clearTimeout(done);
    };
  }, [duration, onDone]);

  return (
    <div
      className="splash-root gate-bg fixed inset-0 z-[100] grid place-items-center overflow-hidden"
      style={{
        opacity: leaving ? 0 : 1,
        transform: leaving ? "scale(1.04)" : "scale(1)",
        transition: "opacity 600ms ease, transform 600ms ease",
      }}
      role="status"
      aria-label="A carregar"
    >
      {SPARKS.map((s, i) => (
        <Heart
          key={i}
          aria-hidden="true"
          className="splash-spark absolute fill-primary/35 text-primary/35"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size, animationDelay: s.delay }}
        />
      ))}

      <div className="flex flex-col items-center px-6 text-center">
        <div className="splash-pulse relative grid size-28 place-items-center rounded-full bg-primary/10">
          <span className="splash-ring absolute inset-0 rounded-full border-2 border-primary/30" aria-hidden="true" />
          <Heart className="size-14 fill-primary text-primary" aria-hidden="true" />
        </div>

        <h1 className="font-hand splash-text mt-7 text-[clamp(2.4rem,8dvh,3.4rem)] font-bold leading-none text-primary">
          Para ti
        </h1>
        <p className="splash-text mt-3 text-sm tracking-[0.22em] text-foreground/60" style={{ animationDelay: "350ms" }}>
          FEITO COM CARINHO
        </p>

        <div className="mt-8 h-1 w-28 overflow-hidden rounded-full bg-primary/15" aria-hidden="true">
          <div className="splash-bar h-full rounded-full bg-primary" style={{ animationDuration: `${duration}ms` }} />
        </div>
      </div>
    </div>
  );
}
