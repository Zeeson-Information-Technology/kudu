type Logo = { name: string; src: string };

export function LogoMarquee({ logos }: { logos?: Logo[] }) {
  const safe = Array.isArray(logos) ? logos : [];
  if (!safe.length) return null;

  const doubled = [...safe, ...safe];

  return (
    <div className="logo-strip" aria-label="Partners and stakeholders">
      <div className="logo-strip__track" role="list">
        {doubled.map((logo, index) => (
          <div className="logo-pill" role="listitem" key={`${logo.name}-${index}`}>
            <img src={logo.src} alt={logo.name} className="logo-pill__img" loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  );
}
