// "+1 (555) 234-5678" -> "+15552345678" (the backend requires digits with a leading +)
export const normalizePhone = (p) => p.replace(/[^\d+]/g, '');

// Frontend stores "lat, lng" strings; the backend wants [lng, lat] numbers
export const toCoordinates = (str) => {
  const [lat, lng] = str.split(',').map((s) => Number(s.trim()));
  return [lng, lat];
};