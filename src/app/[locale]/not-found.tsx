import Link from "next/link";
import { Wordmark } from "@/components/mark";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-8 px-5 text-center">
      <p className="text-[clamp(5rem,20vw,12rem)] font-semibold leading-none tracking-[-0.06em] text-muted/40">404</p>
      <Link href="/"><Wordmark /></Link>
    </main>
  );
}
