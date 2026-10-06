import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

export function SplashScreen({
  onDone,
  duration = 1800,
}: {
  onDone: () => void;
  duration?: number;
}) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const leave = setTimeout(() => setLeaving(true), duration);
    const done = setTimeout(onDone, duration + 450);
    return () => {
      clearTimeout(leave);
      clearTimeout(done);
    };
  }, [duration, onDone]);

  return (
    <div
      className="gate-bg fixed inset-0 z-[100] grid place-items-center"
      style={{ opacity: leaving ? 0 : 1, transition: "opacity 450ms ease" }}
      role="status"
      aria-label="A carregar"
    >
      <div className="splash-fade flex flex-col items-center">
        <Heart className="size-12 fill-primary text-primary" aria-hidden="true" />
        <div
          className="mt-8 h-[3px] w-24 overflow-hidden rounded-full bg-primary/20"
          aria-hidden="true"
        >
          <div
            className="splash-bar h-full rounded-full bg-primary"
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      </div>
    </div>
  );
}
