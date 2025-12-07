export default function Footer() {
  return (
    <footer className="w-full h-10 bg-[var(--color-card)] border-t border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-light)] text-xs md:text-sm fixed bottom-0 left-0 z-40">
      <span>
        © {new Date().getFullYear()} AttentionTrack |
        <a
          href="/privacidad"
          className="ml-2 text-[var(--color-primary)] hover:underline"
        >
          Política de privacidad
        </a>{" "}
        |
        <a
          href="/contacto"
          className="ml-2 text-[var(--color-primary)] hover:underline"
        >
          Contacto
        </a>
      </span>
    </footer>
  );
}
