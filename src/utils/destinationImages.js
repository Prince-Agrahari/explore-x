export const FALLBACK_IMAGE = '/images/travel/fallback.jpg';

export const INDIAN_TRAVEL_IMAGES = [
  { match: ['goa'], name: 'Goa', alt: 'Goa coastline', url: '/images/travel/goa.jpg' },
  { match: ['kerala', 'alleppey', 'alappuzha', 'kochi'], name: 'Kerala', alt: 'Kerala backwaters', url: '/images/travel/kerala.jpg' },
  { match: ['munnar'], name: 'Munnar', alt: 'Munnar tea hills', url: '/images/travel/munnar.jpg' },
  { match: ['ladakh', 'leh'], name: 'Ladakh', alt: 'Ladakh mountains', url: '/images/travel/ladakh.jpg' },
  { match: ['kashmir', 'srinagar'], name: 'Kashmir', alt: 'Kashmir valley', url: '/images/travel/kashmir.jpg' },
  { match: ['manali', 'himachal'], name: 'Manali', alt: 'Manali mountains', url: '/images/travel/manali.jpg' },
  { match: ['jaipur'], name: 'Jaipur', alt: 'Jaipur palace architecture', url: '/images/travel/jaipur.jpg' },
  { match: ['udaipur'], name: 'Udaipur', alt: 'Udaipur city palace', url: '/images/travel/udaipur.jpg' },
  { match: ['jaisalmer'], name: 'Jaisalmer', alt: 'Jaisalmer fort', url: '/images/travel/jaisalmer.jpg' },
  { match: ['varanasi', 'banaras'], name: 'Varanasi', alt: 'Varanasi ghats', url: '/images/travel/varanasi.jpg' },
  { match: ['rishikesh'], name: 'Rishikesh', alt: 'Rishikesh river bridge', url: '/images/travel/rishikesh.jpg' },
  { match: ['sikkim', 'gangtok'], name: 'Sikkim', alt: 'Sikkim mountains', url: '/images/travel/sikkim.jpg' },
  { match: ['meghalaya', 'shillong', 'cherrapunji'], name: 'Meghalaya', alt: 'Meghalaya landscapes', url: '/images/travel/meghalaya.jpg' },
  { match: ['andaman', 'nicobar', 'havelock'], name: 'Andaman', alt: 'Andaman and Nicobar coastline', url: '/images/travel/andaman.jpg' },
  { match: ['darjeeling'], name: 'Darjeeling', alt: 'Darjeeling hills', url: '/images/travel/darjeeling.jpg' },
  { match: ['ooty', 'ootacamund', 'nilgiri'], name: 'Ooty', alt: 'Ooty lake and hills', url: '/images/travel/ooty.jpg' },
];

export const CARD_IMAGES = [
  { alt: 'Kerala backwaters', url: '/images/travel/kerala.jpg' },
  { alt: 'Jaipur palace architecture', url: '/images/travel/jaipur.jpg' },
  { alt: 'Udaipur city palace', url: '/images/travel/udaipur.jpg' },
  { alt: 'Ladakh mountains', url: '/images/travel/ladakh.jpg' },
];

const LAST_HERO_KEY = 'explorex-last-hero';

const hashString = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const readLastHero = () => {
  try {
    return sessionStorage.getItem(LAST_HERO_KEY) || '';
  } catch {
    return '';
  }
};

const writeLastHero = (url) => {
  try {
    sessionStorage.setItem(LAST_HERO_KEY, url);
  } catch {
    /* ignore */
  }
};

export const pickTravelImage = () => {
  const last = readLastHero();
  const pool = INDIAN_TRAVEL_IMAGES.filter((image) => image.url !== last);
  const source = pool.length > 0 ? pool : INDIAN_TRAVEL_IMAGES;
  const pick = source[Math.floor(Math.random() * source.length)];
  writeLastHero(pick.url);
  return pick;
};

export const pickCardImage = (excludeUrl) => {
  const pool = CARD_IMAGES.filter((image) => image.url !== excludeUrl);
  const source = pool.length > 0 ? pool : CARD_IMAGES;
  return source[Math.floor(Math.random() * source.length)];
};

export const getDestinationImage = (destination, coverImage, visitSeed) => {
  if (coverImage) return coverImage;
  const key = (destination || '').toLowerCase();
  const found = INDIAN_TRAVEL_IMAGES.find((entry) => entry.match.some((token) => key.includes(token)));
  if (found) return found.url;
  return INDIAN_TRAVEL_IMAGES[hashString(`${key}|${visitSeed ?? 'travel'}`) % INDIAN_TRAVEL_IMAGES.length].url;
};

export const AUTH_PANEL_IMAGE = '/images/travel/kashmir.jpg';
