const LINKS = [
  ["#origins", "Origins"],
  ["#quality", "Quality"],
  ["#logistics", "Logistics"],
  ["#contact", "Request a sample"],
] as const;

export default function Footer() {
  return (
    <footer className="border-t border-line bg-bg py-12 sm:py-14">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 sm:px-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-lg text-fg">
            Vera Coffee Export<span className="text-accent">.</span>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-faint">
            Specialty green coffee from Yirgacheffe, Sidamo, Guji and Jimma.
            Addis Ababa, Ethiopia.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted sm:gap-x-10">
          {LINKS.map(([href, label]) => (
            <a key={href} href={href} className="py-1 hover:text-fg">
              {label}
            </a>
          ))}
        </nav>
      </div>
      <div className="mx-auto mt-10 max-w-7xl px-5 sm:px-10">
        <p className="border-t border-line pt-6 text-xs text-faint">
          &copy; {new Date().getFullYear()} Vera Coffee Export. All figures
          indicative and subject to confirmation.
        </p>
      </div>
    </footer>
  );
}
