type Logo = { name: string; src: string };

export function LogoWall({ logos }: { logos?: Logo[] }) {
  const safe = Array.isArray(logos) ? logos : [];
  if (!safe.length) return null;

  return (
    <div className="logo-wall section-center" role="list" aria-label="Partners">
      <div className="logo-wall__grid">
        {safe.map((logo) => (
          <div key={logo.name} className="logo-wall__item" role="listitem" title={logo.name}>
            <img src={logo.src} alt={logo.name} className="logo-wall__img" loading="lazy" />
            <span className="logo-wall__label">{logo.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
