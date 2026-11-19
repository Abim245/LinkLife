// Red blood cell compatibility rules as specified in Section 8 & UI/UX Page 1 & 2
export const COMPATIBILITY_MAP = {
  'O-': {
    canGiveTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    label: 'Gives to everyone',
    universal: true,
  },
  'O+': {
    canGiveTo: ['O+', 'A+', 'B+', 'AB+'],
    label: 'O+, A+, B+, AB+',
  },
  'A-': {
    canGiveTo: ['A-', 'A+', 'AB-', 'AB+'],
    label: 'A−, A+, AB−, AB+',
  },
  'A+': {
    canGiveTo: ['A+', 'AB+'],
    label: 'A+, AB+',
  },
  'B-': {
    canGiveTo: ['B-', 'B+', 'AB-', 'AB+'],
    label: 'B−, B+, AB−, AB+',
  },
  'B+': {
    canGiveTo: ['B+', 'AB+'],
    label: 'B+, AB+',
  },
  'AB-': {
    canGiveTo: ['AB-', 'AB+'],
    label: 'AB−, AB+',
  },
  'AB+': {
    canGiveTo: ['AB+'],
    label: 'AB+ only',
  },
};

export const BLOOD_TYPES = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export const canDonate = (donorType, recipientType) => {
  if (!donorType || !recipientType) return false;
  const entry = COMPATIBILITY_MAP[donorType];
  return entry ? entry.canGiveTo.includes(recipientType) : false;
};
