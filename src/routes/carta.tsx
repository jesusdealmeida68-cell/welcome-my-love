import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Heart, Music, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLoveLetter } from "@/lib/gate.functions";

export const Route = createFileRoute("/carta")({
  loader: () => getLoveLetter(),
  head: () => ({ meta: [
    { title: "Uma carta para ti · Nosso Cantinho" },
    { name: "description", content: "Uma carta guardada com carinho, só para ti." },
    { property: "og:title", content: "Uma carta para ti · Nosso Cantinho" },
    { property: "og:description", content: "Uma carta guardada com carinho, só para ti." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: LoveLetter,
});

function LoveLetter() {
  const { poem, photos, music } = Route.useLoaderData();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.6;
    // Tenta tocar ao abrir a carta; se o navegador bloquear, o botão fica disponível.
    audio.play().catch(() => setPlaying(false));
    return () => audio.pause();
  }, []);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => setPlaying(false));
    else audio.pause();
  };

  return (
    <main className="letter-scene min-h-dvh px-5 pb-20 pt-6">
      <audio
        ref={audioRef}
        src={music}
        loop
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={toggleMusic}
        className="fixed right-4 top-4 z-50 text-letter-gold"
        aria-label={playing ? "Pausar música" : "Tocar música"}
      >
        {playing ? <Music /> : <VolumeX />}
      </Button>
      <audio
        ref={audioRef}
        src={music}
        loop
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={toggleMusic}
        className="fixed right-4 top-4 z-50 rounded-full bg-black/20 text-letter-gold backdrop-blur"
        aria-label={playing ? "Pausar música" : "Tocar música"}
        aria-pressed={playing}
      >
        {playing ? <Music className="animate-pulse" /> : <VolumeX />}
      </Button>
      <nav className="mx-auto max-w-4xl">
        <Button asChild variant="ghost" size="icon" className="text-letter-gold" aria-label="Voltar">
          <Link to="/"><ArrowLeft /></Link>
        </Button>
      </nav>
      <header className="mx-auto mb-12 mt-4 max-w-xl text-center">
        <Heart className="mx-auto mb-4 size-5 text-letter-gold" strokeWidth={1} aria-hidden="true" />
        <h1 className="font-display text-4xl leading-tight text-letter-gold sm:text-5xl">Uma carta para ti.</h1>
      </header>
      <div className="letter-layout mx-auto max-w-4xl">
        <article className="letter-paper relative px-6 pb-10 pt-9 sm:px-12 sm:pt-12" aria-label="Poema para Helena">
          <div className="letter-fold" aria-hidden="true" />
          <p className="font-hand mb-8 text-4xl text-primary">Para ti, Helena ♡</p>
          <div className="font-display space-y-7 text-[19px] leading-[1.65] text-letter-ink sm:text-[22px]">
            {poem.split("\n\n").map((stanza, index) => (
              <p key={index} className="whitespace-pre-line">{stanza}</p>
            ))}
          </div>
          <Heart className="mx-auto mt-9 size-5 text-primary/65" strokeWidth={1} aria-hidden="true" />
        </article>
        <aside className="letter-photos" aria-label="Fotos da Helena">
          {photos.map((src, index) => (
            <figure key={src} className={`letter-polaroid letter-photo-${index}`}>
              <img src={src} alt={`Helena — retrato ${index + 1}`} width={720} height={960} className="aspect-[4/5] w-full object-cover" />
              <figcaption className="font-hand mt-3 text-center text-2xl text-letter-ink">{index === 1 ? "O teu sorriso ♡" : "Helena ♡"}</figcaption>
            </figure>
          ))}
        </aside>
      </div>
    </main>
  );
}