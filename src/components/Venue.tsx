"use client";

import { useEffect, useRef } from "react";

const DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=The+Langham+Melbourne,+1+Southgate+Ave,+Southbank+VIC+3006";

/** The Langham Melbourne, 1 Southgate Ave — geocoded from OpenStreetMap. */
const VENUE = { lat: -37.8205784, lon: 144.9657396 };

/* The map is a mosaic of plain tile images rather than an embedded map widget.
   It is only ever a locator, so there is nothing to pan or zoom — and drawing
   it ourselves means no third-party chrome to crop, no script to load, no
   scroll to swallow on a phone, and a marker in our own palette.

   Tiles are Esri's Light Gray Canvas: keyless (CARTO now stamps "API KEY
   REQUIRED" over unauthenticated tiles) and quiet enough to sit under the
   invitation rather than shout over it. Labels ship as a separate transparent
   layer, so the two mosaics are stacked. */
const ESRI = "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas";
const ZOOM = 15;
const TILE_PX = 256;
/** Tiles either side of the centre one, so a 3x3 grid. */
const TILE_RADIUS = 1;

/** Web Mercator: fractional tile coordinates for a lat/lon at a given zoom. */
function tileCoords(lat: number, lon: number, zoom: number) {
  const n = 2 ** zoom;
  const rad = (lat * Math.PI) / 180;
  return {
    x: ((lon + 180) / 360) * n,
    y: ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n,
  };
}

const CENTRE = tileCoords(VENUE.lat, VENUE.lon, ZOOM);
const FIRST_TILE_X = Math.floor(CENTRE.x) - TILE_RADIUS;
const FIRST_TILE_Y = Math.floor(CENTRE.y) - TILE_RADIUS;
const GRID_SPAN = TILE_RADIUS * 2 + 1;
const MOSAIC_PX = GRID_SPAN * TILE_PX;

/** Where the venue falls inside the mosaic, so it can be pinned to the centre. */
const VENUE_OFFSET = {
  x: (CENTRE.x - FIRST_TILE_X) * TILE_PX,
  y: (CENTRE.y - FIRST_TILE_Y) * TILE_PX,
};

const TILES = Array.from({ length: GRID_SPAN * GRID_SPAN }, (_, i) => ({
  x: FIRST_TILE_X + (i % GRID_SPAN),
  y: FIRST_TILE_Y + Math.floor(i / GRID_SPAN),
}));

/** Esri orders its path {z}/{y}/{x}, not {z}/{x}/{y}. */
const tileUrl = (layer: string, x: number, y: number) =>
  `${ESRI}/${layer}/MapServer/tile/${ZOOM}/${y}/${x}`;

/** One full-bleed mosaic, positioned so the venue lands at the frame's centre. */
function TileLayer({ layer }: { layer: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        width: MOSAIC_PX,
        height: MOSAIC_PX,
        left: `calc(50% - ${VENUE_OFFSET.x}px)`,
        top: `calc(50% - ${VENUE_OFFSET.y}px)`,
        display: "grid",
        gridTemplateColumns: `repeat(${GRID_SPAN}, ${TILE_PX}px)`,
        gridAutoRows: `${TILE_PX}px`,
      }}
    >
      {TILES.map((tile) => (
        // Plain <img>: tiles are already exactly the right size and come from a
        // CDN, so routing them through next/image would only add a proxy hop.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${tile.x}-${tile.y}`}
          src={tileUrl(layer, tile.x, tile.y)}
          alt=""
          width={TILE_PX}
          height={TILE_PX}
          loading="lazy"
          decoding="async"
          draggable={false}
          style={{ display: "block", width: TILE_PX, height: TILE_PX }}
        />
      ))}
    </div>
  );
}

/**
 * A locator map: it shows where the venue is, then hands the guest to Google
 * Maps for the directions they actually want.
 */
function VenueMap() {
  return (
    <figure style={{ margin: 0 }}>
      <div
        className="venue-map"
        style={{
          position: "relative",
          aspectRatio: "4/3",
          overflow: "hidden",
          backgroundColor: "var(--color-card)",
          border: "1px solid var(--color-border-hairline)",
        }}
      >
        <TileLayer layer="World_Light_Gray_Base" />
        <TileLayer layer="World_Light_Gray_Reference" />

        {/* The marker sits at the container's centre, which is where the
            mosaic has been positioned to put the venue. */}
        <svg
          aria-hidden="true"
          width="34"
          height="34"
          viewBox="0 0 34 34"
          fill="none"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            // The pin points at its tip, so anchor the tip, not the centre.
            transform: "translate(-50%, -100%)",
          }}
        >
          <path
            d="M17 3.5c-4.7 0-8.5 3.8-8.5 8.5 0 6.2 8.5 15 8.5 15s8.5-8.8 8.5-15c0-4.7-3.8-8.5-8.5-8.5z"
            fill="var(--color-burgundy)"
            stroke="var(--color-card)"
            strokeWidth="1.5"
          />
          <circle cx="17" cy="12" r="3.2" fill="var(--color-gold-leaf)" />
        </svg>

        <a
          href={DIRECTIONS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="venue-map-link"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: 16,
            textDecoration: "none",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              minHeight: 44,
              padding: "10px 20px",
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border-strong)",
              borderRadius: "var(--radius-full)",
              color: "var(--color-burgundy)",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-eyebrow)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              transition:
                "background-color var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard)",
            }}
          >
            Open in Google Maps
            <span className="sr-only">(opens in a new tab)</span>
          </span>
        </a>
      </div>

      <figcaption
        style={{
          marginTop: 8,
          fontSize: "var(--text-eyebrow)",
          color: "var(--color-ink-muted)",
        }}
      >
        1 Southgate Ave, Southbank · map ©{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "inherit", textDecoration: "underline" }}
        >
          OpenStreetMap
        </a>{" "}
        contributors, tiles © Esri
      </figcaption>
    </figure>
  );
}

export default function Venue() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="venue"
      ref={sectionRef}
      className="section-reveal"
      style={{ padding: "clamp(64px, 9vw, 128px) 0" }}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-20">
        <div className="mb-12 text-center">
          <p
            className="uppercase tracking-widest"
            style={{
              fontSize: "var(--text-eyebrow)",
              color: "var(--color-gold-ink)",
              letterSpacing: "0.14em",
              marginBottom: 12,
            }}
          >
            Venue
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-h2)",
              fontWeight: 600,
              color: "var(--color-ink)",
              lineHeight: 1.15,
            }}
          >
            The Langham Melbourne
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <address
              className="not-italic mb-4"
              style={{
                fontSize: "var(--text-body)",
                color: "var(--color-ink)",
                lineHeight: 1.7,
              }}
            >
              1 Southgate Ave
              <br />
              Southbank VIC 3006
            </address>

            <div
              className="p-5 mb-8 flex gap-4 items-start on-burgundy"
              style={{
                backgroundColor: "var(--color-burgundy)",
                color: "var(--color-burgundy-ink)",
              }}
            >
              <span
                aria-hidden="true"
                style={{ fontSize: "1.25rem", lineHeight: 1, marginTop: 2 }}
              >
                🅿
              </span>
              <div>
                <p
                  style={{
                    fontWeight: 600,
                    fontSize: "var(--text-small)",
                    fontFamily: "var(--font-body)",
                    marginBottom: 4,
                  }}
                >
                  Discounted parking is available.
                </p>
                <p style={{ fontSize: "var(--text-small)", opacity: 0.9 }}>
                  Please have your ticket validated at hotel reception.
                </p>
              </div>
            </div>

            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-press inline-flex items-center gap-2"
              style={{
                padding: "14px 28px",
                minHeight: 44,
                border: "1.5px solid var(--color-burgundy)",
                color: "var(--color-burgundy)",
                fontSize: "var(--text-small)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                textDecoration: "none",
                fontFamily: "var(--font-body)",
                transition:
                  "background-color var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-burgundy)";
                e.currentTarget.style.color = "var(--color-burgundy-ink)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--color-burgundy)";
              }}
            >
              Get Driving Directions
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>

          <VenueMap />
        </div>
      </div>
    </section>
  );
}
