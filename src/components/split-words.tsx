/** Words rise out of blur one after another (CSS, starts on first paint); screen readers get the plain sentence. */
export function SplitWords({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {text.split(" ").map((w, i) => (
          <span key={i} className="word" style={{ "--i": i, "--d": `${delay}ms` } as React.CSSProperties}>
            <span>{w}&nbsp;</span>
          </span>
        ))}
      </span>
    </>
  );
}
