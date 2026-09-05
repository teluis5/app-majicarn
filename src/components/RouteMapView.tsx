import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Map, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

interface RouteMapViewProps {
  fromName: string;
  toName: string;
  fromCoords: { lat: number; lon: number };
  toCoords: { lat: number; lon: number };
  routeCoordinates: [number, number][]; // [lat, lon][]
  googleMapsUrl: string;
  isRoundTrip: boolean;
  distanceKm: number;
}

export const RouteMapView: React.FC<RouteMapViewProps> = ({
  fromName,
  toName,
  fromCoords,
  toCoords,
  routeCoordinates,
  googleMapsUrl,
  isRoundTrip,
  distanceKm,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (!mapContainerRef.current || !isExpanded) return;

    // 既存マップインスタンスの破棄
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // 地図の初期化
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    });
    mapInstanceRef.current = map;

    // ズームコントロールを右下に
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // OpenStreetMap タイルレイヤー
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(map);

    // SVGカスタムマーカー（画像不要で高解像度表示）
    const startIcon = L.divIcon({
      className: 'custom-start-marker',
      html: `
        <div style="background-color: #10b981; width: 24px; height: 24px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 11px;">
          発
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const endIcon = L.divIcon({
      className: 'custom-end-marker',
      html: `
        <div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 11px;">
          着
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    // マーカー配置
    const startMarker = L.marker([fromCoords.lat, fromCoords.lon], { icon: startIcon })
      .addTo(map)
      .bindPopup(`<b>出発:</b> ${fromName}`);

    const endMarker = L.marker([toCoords.lat, toCoords.lon], { icon: endIcon })
      .addTo(map)
      .bindPopup(`<b>到着:</b> ${toName}`);

    // 経路ポリライン
    let polyline: L.Polyline;
    if (routeCoordinates && routeCoordinates.length > 0) {
      polyline = L.polyline(routeCoordinates, {
        color: '#2563eb',
        weight: 5,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);
    } else {
      // フォールバック直線
      polyline = L.polyline(
        [
          [fromCoords.lat, fromCoords.lon],
          [toCoords.lat, toCoords.lon],
        ],
        { color: '#2563eb', weight: 4, dashArray: '6, 8', opacity: 0.7 }
      ).addTo(map);
    }

    // ルート全体が収まるように自動ズーム調整
    const group = L.featureGroup([startMarker, endMarker, polyline]);
    map.fitBounds(group.getBounds(), {
      padding: [25, 25],
      maxZoom: 14,
    });

    // リサイズ対応（コンテナサイズ確定後の再描画）
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [fromCoords, toCoords, routeCoordinates, fromName, toName, isExpanded]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs transition-all mt-2.5">
      {/* マップヘッダー */}
      <div className="px-3 py-2 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex items-center gap-1.5 text-xs font-black text-slate-800 hover:text-blue-600 transition-colors"
        >
          <Map className="w-3.5 h-3.5 text-blue-600" />
          <span>
            経路マップ ({fromName} ⇄ {toName})
          </span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          )}
        </button>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200/60 transition-colors"
        >
          <span>Google マップで開く</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* マップ本体 */}
      {isExpanded && (
        <div className="relative">
          <div
            ref={mapContainerRef}
            className="w-full h-44 sm:h-52 z-0 bg-slate-100"
            style={{ minHeight: '175px' }}
          />

          {/* ルート情報バッジ */}
          <div className="absolute top-2 left-2 z-[400] bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl shadow-xs border border-slate-200/80 text-[10px] font-bold text-slate-700 flex items-center gap-2 pointer-events-none">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              {fromName}
            </span>
            <span>➔</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              {toName}
            </span>
            <span className="text-blue-600 font-extrabold ml-1">
              {distanceKm}km ({isRoundTrip ? '往復' : '片道'})
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
