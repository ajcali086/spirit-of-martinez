import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  HORHAM,
  THEATER,
  missionChapter,
  missionPlaces,
  missions,
  parseMissionsHash,
  placeKey,
  type MissionPlace,
} from "@/data/missions";
import type { Mission } from "@/data/types";
import { cn } from "@/lib/utils";

type KindFilter = "all" | "combat" | "humanitarian";

function pinLabel(records: Mission[], focusNumber: number) {
  if (records.some((m) => m.number === focusNumber) && records.length === 1) {
    return String(focusNumber).padStart(2, "0");
  }
  if (records.length > 1) return String(records.length);
  return String(records[0].number).padStart(2, "0");
}

export function MissionMap() {
  const mapId = useId().replace(/:/g, "");
  const hash = useRouterState({ select: (s) => s.location.hash });
  const parsed = parseMissionsHash(hash);
  const focusNumber = parsed?.view === "map" ? parsed.number : 7;
  const shellRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Map<string, LeafletMarker>>(new Map());
  const [kind, setKind] = useState<KindFilter>("all");
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const revealedFor = useRef<number | null>(null);
  const lastActiveRef = useRef<string | null>(null);
  const userOpened = useRef(false);

  const visible = useMemo(() => {
    if (kind === "all") return missions;
    return missions.filter((m) => m.kind === kind);
  }, [kind]);
  const places = useMemo(() => missionPlaces(visible), [visible]);

  useEffect(() => {
    let dead = false;
    let dropPointer: (() => void) | undefined;
    if (!mapRef.current) return;

    (async () => {
      try {
        const leaflet = await import("leaflet");
        const L = leaflet.default;
        const europe = await fetch("/data/europe.json").then((r) => {
          if (!r.ok) throw new Error("europe");
          return r.json();
        });
        if (dead || !mapRef.current) return;

        const map = L.map(mapRef.current, {
          zoomControl: true,
          scrollWheelZoom: false,
          attributionControl: true,
          minZoom: 4,
          maxZoom: 9,
          maxBounds: L.latLngBounds(THEATER.sw, THEATER.ne),
          maxBoundsViscosity: 1,
          worldCopyJump: false,
          fadeAnimation: false,
          zoomAnimation: false,
          markerZoomAnimation: false,
        });
        leafletRef.current = map;

        const phone = window.matchMedia("(max-width: 899px)");
        const applyDrag = () => {
          if (phone.matches) {
            map.dragging.disable();
            map.touchZoom.enable();
          } else {
            map.dragging.enable();
            map.touchZoom.enable();
          }
        };
        applyDrag();
        phone.addEventListener("change", applyDrag);

        const surface = map.getContainer();
        let twoFinger: { x: number; y: number } | null = null;
        const mid = (touches: TouchList) => ({
          x: (touches[0].clientX + touches[1].clientX) / 2,
          y: (touches[0].clientY + touches[1].clientY) / 2,
        });
        const onTouchStart = (e: TouchEvent) => {
          twoFinger = e.touches.length === 2 ? mid(e.touches) : null;
        };
        const onTouchMove = (e: TouchEvent) => {
          if (e.touches.length !== 2 || !twoFinger) return;
          e.preventDefault();
          const now = mid(e.touches);
          map.panBy([twoFinger.x - now.x, twoFinger.y - now.y], { animate: false });
          twoFinger = now;
        };
        const onTouchEnd = () => {
          twoFinger = null;
        };
        surface.addEventListener("touchstart", onTouchStart, { passive: true });
        surface.addEventListener("touchmove", onTouchMove, { passive: false });
        surface.addEventListener("touchend", onTouchEnd);
        surface.addEventListener("touchcancel", onTouchEnd);

        dropPointer = () => {
          phone.removeEventListener("change", applyDrag);
          surface.removeEventListener("touchstart", onTouchStart);
          surface.removeEventListener("touchmove", onTouchMove);
          surface.removeEventListener("touchend", onTouchEnd);
          surface.removeEventListener("touchcancel", onTouchEnd);
        };

        L.geoJSON(europe, {
          style: {
            color: "#7a7366",
            weight: 0.8,
            fillColor: "#1c1a16",
            fillOpacity: 0.94,
          },
          interactive: false,
        }).addTo(map);
        map.attributionControl.addAttribution(
          'Map geometry: <a href="https://www.naturalearthdata.com/">Natural Earth</a>',
        );

        const baseIcon = L.divIcon({
          className: "mission-pin base",
          html: "<span><b>119</b></span>",
          iconSize: [30, 30],
          iconAnchor: [15, 15],
          popupAnchor: [0, -16],
        });
        L.marker([HORHAM.lat, HORHAM.lng], {
          icon: baseIcon,
          title: HORHAM.label,
          keyboard: false,
        })
          .addTo(map)
          .bindPopup(
            `<div class="pop-kicker">Departure field</div><div class="pop-title">Horham</div><div class="pop-record"><strong>AAF Station 119</strong><br>95th Bomb Group · Suffolk, England</div><p class="pop-note">The base marker is context, not a drawn route origin.</p>`,
          );
        if (!dead) setReady(true);
      } catch {
        if (!dead) setFailed(true);
      }
    })();

    return () => {
      dead = true;
      dropPointer?.();
      leafletRef.current?.remove();
      leafletRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const map = leafletRef.current;
    if (!map || failed || !ready) return;
    let cancelled = false;

    (async () => {
      const leaflet = await import("leaflet");
      const L = leaflet.default;
      if (cancelled || leafletRef.current !== map) return;

      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();

      for (const place of places) {
        const focus = place.missions.some((m) => m.number === focusNumber);
        const food = place.missions.every((m) => m.kind === "humanitarian");
        const size = focus ? 38 : place.missions.length > 1 ? 34 : 28;
        const icon = L.divIcon({
          className: `mission-pin ${food ? "food" : "combat"} ${place.missions.length > 1 ? "multi" : ""} ${focus ? "focus" : ""}`,
          html: `<span>${pinLabel(place.missions, focusNumber)}</span>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
          popupAnchor: [0, -18],
        });
        const marker = L.marker([place.lat, place.lng], {
          icon,
          title: `${place.target}: ${place.missions.length} ${place.missions.length === 1 ? "sortie" : "sorties"}`,
          keyboard: false,
          riseOnHover: true,
        })
          .addTo(map)
          .bindPopup(popupHtml(place), { maxWidth: 320 });
        marker.on("click", () => {
          setActiveKey(place.key);
          lastActiveRef.current = place.key;
          userOpened.current = true;
        });
        markersRef.current.set(place.key, marker);
      }

      const focused = places.find((p) =>
        p.missions.some((m) => m.number === focusNumber),
      );
      const firstReveal = revealedFor.current !== focusNumber;
      if (firstReveal && focused) {
        map.fitBounds(
          [
            [HORHAM.lat, HORHAM.lng],
            [focused.lat, focused.lng],
          ],
          { padding: [48, 48], maxZoom: 6, animate: false },
        );
        markersRef.current.get(focused.key)?.openPopup();
        setActiveKey(focused.key);
        lastActiveRef.current = focused.key;
        revealedFor.current = focusNumber;
      } else if (
        userOpened.current &&
        lastActiveRef.current &&
        markersRef.current.has(lastActiveRef.current)
      ) {
        const keep = lastActiveRef.current;
        markersRef.current.get(keep)?.openPopup();
        setActiveKey(keep);
      } else {
        map.closePopup();
        setActiveKey(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [places, kind, failed, ready, focusNumber]);

  function locate(key: string) {
    const marker = markersRef.current.get(key);
    const map = leafletRef.current;
    if (!marker || !map) return;
    setActiveKey(key);
    lastActiveRef.current = key;
    userOpened.current = true;
    map.setView(marker.getLatLng(), Math.max(map.getZoom(), 6), { animate: false });
    marker.openPopup();
    if (window.innerWidth < 900) {
      shellRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function showAll() {
    const map = leafletRef.current;
    if (!map) return;
    map.fitBounds(
      [
        [HORHAM.lat, HORHAM.lng],
        ...places.map((p) => [p.lat, p.lng] as [number, number]),
      ],
      { padding: [38, 38], maxZoom: 6 },
    );
    map.closePopup();
    setActiveKey(null);
    lastActiveRef.current = null;
    userOpened.current = false;
  }

  return (
    <div className="mission-map mt-6">
      <p className="max-w-2xl text-sm leading-relaxed text-muted">
        Targets in geographic context. Markers are modern city or district
        centers, not wartime aim points. No line is a claimed flight path.
        Repeated names share one pin.
        {focusNumber === 7
          ? " Mission 7 opens first: the chart’s date and the crew record’s date are both on the panel."
          : ` Mission ${String(focusNumber).padStart(2, "0")} is marked.`}
      </p>

      <div className="mt-6 flex flex-wrap gap-2" aria-label="Map filters">
        {(
          [
            ["all", "All 31"],
            ["combat", "Combat 28"],
            ["humanitarian", "Chowhound 3"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={kind === id}
            onClick={() => setKind(id)}
            className={cn(
              "min-h-11 px-4 text-[0.72rem] tracking-[0.16em] uppercase transition-colors",
              kind === id
                ? "bg-brass text-ink"
                : "border border-rule text-fog hover:text-paper",
            )}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={showAll}
          className="min-h-11 border border-rule px-4 text-[0.72rem] tracking-[0.16em] text-fog uppercase hover:text-paper"
        >
          Show all targets
        </button>
      </div>

      <section
        ref={shellRef}
        className="mt-4 grid border border-rule bg-ink-soft lg:grid-cols-[minmax(0,1.65fr)_minmax(18rem,.65fr)]"
        aria-label="Mission target map and chronological index"
      >
        <div className={cn("relative min-h-[500px] bg-ink-mid lg:min-h-[640px]", failed && "min-h-0")}>
          <div
            id={`mission-map-${mapId}`}
            ref={mapRef}
            role="application"
            aria-label="Interactive map of mission targets from Horham"
            className={cn("size-full min-h-[500px] lg:min-h-[640px]", failed && "hidden")}
          />
          {failed ? (
            <div className="px-6 py-16">
              <p className="font-display text-2xl text-paper">The map did not load.</p>
              <p className="mt-3 max-w-lg text-sm text-muted">
                The ledger remains. Every marker uses a modern geocoded center
                of the named target, not a wartime aim point.
              </p>
            </div>
          ) : (
            <p className="pointer-events-none absolute bottom-6 left-3 z-10 max-w-xs border-l-2 border-brass bg-ink/90 px-3 py-2 font-sans text-[0.65rem] leading-relaxed tracking-wide text-muted uppercase">
              Natural Earth 1:110m · modern centers · no drawn route
            </p>
          )}
        </div>

        <aside className="flex min-h-0 flex-col border-t border-rule lg:border-t-0 lg:border-l">
          <div className="flex items-baseline justify-between gap-3 border-b border-rule px-5 py-4">
            <h2 className="font-display text-2xl text-paper">Ledger</h2>
            <span className="text-[0.68rem] tracking-[0.14em] text-muted uppercase">
              {visible.length} {visible.length === 1 ? "record" : "records"}
            </span>
          </div>
          <ol className="max-h-[620px] min-h-0 overflow-auto lg:max-h-[640px]">
            {visible.map((m) => {
              const k = placeKey(m);
              const chapter = missionChapter(m);
              const on = k === activeKey;
              return (
                <li
                  key={`${m.number}-${m.date}`}
                  className={cn(
                    "grid grid-cols-[2.6rem_1fr_auto] gap-3 border-b border-rule px-4 py-3",
                    on && "bg-feather/15",
                  )}
                >
                  <span
                    className={cn(
                      "font-display text-lg",
                      on ? "text-feather" : "text-brass",
                    )}
                  >
                    {m.kind === "humanitarian" ? "Food" : String(m.number).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-display text-lg leading-tight text-paper">{m.target}</p>
                    <p className="mt-1 text-[0.68rem] tracking-wide text-muted">
                      {m.dateLabel}
                    </p>
                    <Link
                      to="/chapters/$slug"
                      params={{ slug: chapter.slug }}
                      hash={chapter.hash}
                      className="mt-1 inline-flex min-h-11 items-center text-[0.65rem] tracking-[0.14em] text-brass uppercase hover:text-paper"
                    >
                      {chapter.label}
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => locate(k)}
                    aria-label={`Locate ${m.target} on the map`}
                    className="size-11 shrink-0 border border-rule text-muted hover:border-brass hover:text-paper"
                  >
                    <span className="sr-only">Locate</span>
                    <span aria-hidden className="font-sans text-[0.65rem] tracking-widest uppercase">
                      Pin
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>
      </section>
    </div>
  );
}

function popupHtml(place: MissionPlace) {
  const seven = place.missions.find((m) => m.number === 7);
  const note = place.missions.find((m) => m.placeNote)?.placeNote;
  const chart = seven
    ? `<div class="chart-transcript">
        <div class="chart-row"><span>Printed</span><b>Captains of Aircraft Map<br>Newcastle to Prague</b></div>
        <div class="chart-row"><span>In hand</span><b>Mission #7<br>23 Feb. 1945</b></div>
        <div class="chart-row"><span>Crew record</span><b>24 February 1945<br>Bremen</b></div>
        <div class="chart-row"><span>On the sheet</span><b>Control points · IP · RP · fighters · flak in colored pencil</b></div>
        <div class="chart-row"><span>Unread</span><b>The rest of the hand is untranscribed. Whose hand is not established here.</b></div>
      </div>
      <a class="archive-door" href="/archive/chart7">Open the original chart</a>`
    : "";
  const lines = place.missions
    .map((m) => {
      const chapter = missionChapter(m);
      const kind =
        m.kind === "humanitarian" ? "Operation Chowhound food drop" : "Combat mission";
      return `<div class="pop-record"><strong>${String(m.number).padStart(2, "0")} · ${esc(m.dateLabel)}</strong><br>${kind} · ${esc(m.aircraft)}<br><a class="archive-door" href="/chapters/${esc(chapter.slug)}#${esc(chapter.hash)}">${esc(chapter.label)}</a> <a class="archive-door" href="/missions#m-${m.number}">The board</a></div>`;
    })
    .join("");
  return `<div class="pop-kicker">${seven ? "Captain’s chart · partial transcription" : place.missions.length > 1 ? `${place.missions.length} records at one point` : "Mission information"}</div>
    <div class="pop-title">${esc(place.target)}</div>
    ${chart}
    ${lines}
    <p class="pop-note">${note ? esc(note) + " " : ""}Marker uses the modern center of the named target area. No line is a claimed flight path.</p>`;
}

function esc(v: string) {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
