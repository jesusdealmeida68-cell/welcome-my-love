export function Polaroid({
  src,
  alt,
  name,
  tilt,
}: {
  src: string;
  alt: string;
  name: string;
  tilt: string;
}) {
  return (
    <figure
      className={`relative w-[min(40vw,10.5rem)] bg-polaroid p-2 pb-9 shadow-polaroid ${tilt}`}
    >
      <img
        src={src}
        alt={alt}
        width={720}
        height={960}
        loading="eager"
        className="aspect-[4/5] w-full object-cover"
      />
      <figcaption className="font-hand absolute inset-x-0 bottom-1.5 text-center text-2xl font-bold leading-none text-foreground/75">
        {name}
      </figcaption>
    </figure>
  );
}
