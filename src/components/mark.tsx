import Image from "next/image";
import logo from "@/assets/morefin-logo.png";
import star from "@/assets/morefin-star.png";

// The official Morefin logo (3D star + serif wordmark with the pixel "fin"). Every logo spot uses these two files;
// they are cut from brand/morefin-logo-source.jpg by brand/cut-logo.py.
export { logo as LOGO };

// blue on the dark theme's navy is a touch dim, so it is lifted there
const LIFT = "dark:brightness-[1.35]";

// `height` is the largest height it is shown at (px), so the browser only fetches a picture that size, not the full file
export function Wordmark({ className = "h-8", height = 32, priority = false }: { className?: string; height?: number; priority?: boolean }) {
  const width = Math.round((height * logo.width) / logo.height);
  return <Image src={logo} alt="Morefin" width={width} height={height} priority={priority} className={`w-auto ${LIFT} ${className}`} />;
}

export function MorefinMark({ className = "size-6", size = 24 }: { className?: string; size?: number }) {
  return <Image src={star} alt="" aria-hidden width={size} height={size} className={`${LIFT} ${className}`} />;
}
