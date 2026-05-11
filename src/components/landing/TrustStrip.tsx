"use client";

const LOGOS = [
  "Allianz", "AXA", "Anadolu Sigorta", "Mapfre", "HDI", "Zurich",
  "Allianz", "AXA", "Anadolu Sigorta", "Mapfre", "HDI", "Zurich",
];

export default function TrustStrip() {
  return (
    <div className="lp-trust" aria-label="Güvenilen şirketler">
      <div className="lp-trust__track" aria-hidden="true">
        {LOGOS.map((logo, i) => (
          <span key={i} className="lp-trust__logo">{logo}</span>
        ))}
      </div>
    </div>
  );
}
