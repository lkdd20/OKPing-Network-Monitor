import { ExternalLink, MapPin } from "lucide-react";

function mapUrls(latitude: number, longitude: number) {
  const span = 0.18;
  const bbox = [longitude - span, latitude - span, longitude + span, latitude + span]
    .map((value) => value.toFixed(6))
    .join("%2C");
  return {
    detail: `https://www.openstreetmap.org/?mlat=${latitude.toFixed(6)}&mlon=${longitude.toFixed(6)}#map=10/${latitude.toFixed(6)}/${longitude.toFixed(6)}`,
    embed: `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude.toFixed(6)}%2C${longitude.toFixed(6)}`,
  };
}

export function IpLocationMap({
  ip,
  latitude,
  location,
  longitude,
}: {
  ip: string;
  latitude: number;
  location: string;
  longitude: number;
}) {
  const urls = mapUrls(latitude, longitude);
  return (
    <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="flex h-12 items-center justify-between border-b border-zinc-200 px-5 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <MapPin aria-hidden="true" className="text-blue-600 dark:text-blue-400" size={17} />
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">地图定位</h2>
        </div>
        <a className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400" href={urls.detail} rel="noreferrer" target="_blank">
          OpenStreetMap <ExternalLink aria-hidden="true" size={12} />
        </a>
      </div>
      <div className="relative h-[360px] bg-zinc-100 dark:bg-gray-800">
        <iframe className="h-full w-full border-0" loading="lazy" src={urls.embed} title={`${ip} ${location} 地图定位`} />
        <div className="pointer-events-none absolute left-4 top-4 max-w-[420px] rounded-md border border-zinc-200 bg-white/95 px-3 py-2 text-xs leading-5 text-zinc-700 shadow dark:border-gray-600 dark:bg-gray-900/95 dark:text-gray-200">
          <strong className="mr-2 text-zinc-900 dark:text-zinc-100">{ip}</strong>
          {location}
        </div>
      </div>
    </section>
  );
}
