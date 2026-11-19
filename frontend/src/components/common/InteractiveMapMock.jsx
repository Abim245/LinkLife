import { useState } from 'react';
import { MapPin, Navigation, Compass } from 'lucide-react';

export const InteractiveMapMock = ({
  mode = 'rings', // 'rings' | 'route' | 'pin' | 'area'
  radiusKm = 10,
  outerRadiusKm = 25,
  hospitalName = 'St. Jude Emergency Hospital',
  distanceText = '2.4 km away',
  editable = false,
  height = 'h-56',
  className = '',
}) => {
  const [pinPosition, setPinPosition] = useState({ x: 50, y: 50 });

  const handleMapClick = (e) => {
    if (!editable) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(10, Math.min(90, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(10, Math.min(90, ((e.clientY - rect.top) / rect.height) * 100));
    setPinPosition({ x, y });
  };

  return (
    <div
      onClick={handleMapClick}
      className={`relative w-full ${height} rounded-xl overflow-hidden border border-red-100 bg-[#FBF5F2] select-none transition-all shadow-inner group ${
        editable ? 'cursor-crosshair' : 'cursor-default'
      } ${className}`}
    >
      {/* Map Grid / Topography background patterns */}
      <svg className="absolute inset-0 w-full h-full opacity-35 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid-pattern" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#E2D9D2" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        <path
          d="M -20,60 Q 80,40 180,90 T 380,120 T 600,80"
          fill="none"
          stroke="#E5DBD5"
          strokeWidth="6"
        />
        <path
          d="M 120,-20 Q 150,100 240,160 T 420,300"
          fill="none"
          stroke="#E5DBD5"
          strokeWidth="5"
        />
        <path
          d="M -10,180 Q 200,160 400,220"
          fill="none"
          stroke="#DDE6ED"
          strokeWidth="8"
        />
      </svg>

      {/* Mode: Rings (Hospital search area 10km and 25km) */}
      {mode === 'rings' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Outer 25 km ring */}
          <div className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full border border-dashed border-[#B81D24]/30 bg-[#B81D24]/5 flex items-start justify-center">
            <span className="text-[10px] uppercase font-bold text-[#B81D24]/70 bg-white/90 px-1.5 py-0.5 rounded shadow-xs mt-1">
              {outerRadiusKm} km range
            </span>
          </div>

          {/* Inner 10 km ring with subtle pulse */}
          <div className="absolute w-44 h-44 sm:w-48 sm:h-48 rounded-full border-2 border-[#B81D24]/50 bg-[#B81D24]/10 flex items-start justify-center animate-pulse">
            <span className="text-[10px] font-bold text-[#B81D24] bg-white px-2 py-0.5 rounded-full shadow-xs mt-1 border border-red-200">
              Active: {radiusKm} km
            </span>
          </div>

          {/* Center Hospital Pin */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-[#B81D24] text-white flex items-center justify-center shadow-lg ring-4 ring-red-100">
              <MapPin className="w-5 h-5 fill-white text-[#B81D24]" />
            </div>
            <span className="text-xs font-semibold text-gray-800 bg-white/95 px-2 py-0.5 rounded-md shadow-xs mt-1 border border-gray-200">
              {hospitalName}
            </span>
          </div>
        </div>
      )}

      {/* Mode: Route (Donor to Hospital with route) */}
      {mode === 'route' && (
        <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M 25% 65% Q 40% 30% 75% 40%"
              fill="none"
              stroke="#B81D24"
              strokeWidth="3"
              strokeDasharray="6 4"
            />
          </svg>

          {/* Donor Point */}
          <div className="absolute left-[20%] top-[60%] flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md ring-2 ring-emerald-100">
              <Navigation className="w-4 h-4 fill-white" />
            </div>
            <span className="text-[11px] font-semibold text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded mt-1 border border-emerald-200">
              You
            </span>
          </div>

          {/* Distance Badge */}
          <div className="absolute left-[45%] top-[34%] bg-white text-stone-800 text-xs font-bold px-2.5 py-1 rounded-full shadow-md border border-stone-200 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-[#B81D24]" />
            {distanceText}
          </div>

          {/* Hospital Point */}
          <div className="absolute left-[70%] top-[35%] flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-[#B81D24] text-white flex items-center justify-center shadow-md ring-2 ring-red-200">
              <MapPin className="w-4 h-4 fill-white" />
            </div>
            <span className="text-[11px] font-semibold text-gray-800 bg-white px-2 py-0.5 rounded mt-1 border border-gray-200">
              {hospitalName}
            </span>
          </div>
        </div>
      )}

      {/* Mode: Pin (Draggable / Click to set entrance pin) */}
      {mode === 'pin' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            style={{ left: `${pinPosition.x}%`, top: `${pinPosition.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center transition-all duration-150"
          >
            <div className="w-9 h-9 rounded-full bg-[#B81D24] text-white flex items-center justify-center shadow-lg ring-4 ring-white animate-bounce">
              <MapPin className="w-5 h-5 fill-white text-[#B81D24]" />
            </div>
            <span className="text-xs font-semibold text-white bg-black/80 px-2 py-0.5 rounded shadow-md mt-1 whitespace-nowrap">
              Main Entrance (GPS: {pinPosition.x.toFixed(2)}, {pinPosition.y.toFixed(2)})
            </span>
          </div>

          {editable && (
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs text-xs font-medium text-stone-700 px-2.5 py-1 rounded-md border border-stone-200 shadow-xs">
              Click anywhere on map to reposition entrance pin
            </div>
          )}
        </div>
      )}

      {/* Mode: Area (Donor approximate neighborhood) */}
      {mode === 'area' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-44 h-44 rounded-full border-2 border-dashed border-[#B81D24]/40 bg-[#B81D24]/10 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-[#B81D24] ring-4 ring-red-100" />
          </div>
          <div className="absolute bottom-3 right-3 bg-white/90 px-2.5 py-1 rounded text-xs font-medium text-stone-600 border border-stone-200">
            Matching Area: 15 km
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div className="absolute top-2 right-2 flex flex-col gap-1 pointer-events-none">
        <div className="w-7 h-7 bg-white/90 rounded border border-stone-200 shadow-xs flex items-center justify-center text-stone-600 text-xs font-bold">
          +
        </div>
        <div className="w-7 h-7 bg-white/90 rounded border border-stone-200 shadow-xs flex items-center justify-center text-stone-600 text-xs font-bold">
          −
        </div>
      </div>
    </div>
  );
};

export default InteractiveMapMock;
