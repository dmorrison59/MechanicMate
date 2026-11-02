import { Linking } from 'react-native';

// ── Monetization ─────────────────────────────────────────
// Paste approved tracking IDs here. Blank = a plain, untracked link
// (exactly today's behavior). The moment a value appears, that button
// starts earning — no other code change required.
//
//  • amazon   → your Amazon Associates tag, e.g. 'mechanicmate-20'
//  • the rest → ONLY fill these if/when you're approved on that
//               retailer's network (CJ / Impact / ShareASale); each
//               network uses its OWN parameter name, so I'll wire each
//               correctly the day you hand me an approved link. Don't
//               guess the format — a wrong param just silently no-ops.
export const AFFILIATE = {
  amazon:   '',   // ← start here: 'mechanicmate-20'
  autozone: '',
  oreilly:  '',
  rockauto: '',
};

// Appends a tracking param only when a tag exists, and picks the right
// separator (? vs &) so it never corrupts the URL.
const withTag = (url, tag) => {
  if (!tag) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}tag=${encodeURIComponent(tag)}`;
};
// ⚠️  Replace with your real Amazon Associates tag before release.
export const AMAZON_AFFILIATE_TAG = '';  // e.g. 'yourname-20'

function openURL(url) {
  Linking.openURL(url).catch(() => {});
}

export function buildQuery(vehicleString, part) {
  return `${vehicleString} ${part.term}`.trim();
}

export function searchAutoZone(vehicleString, part) {
  const q = encodeURIComponent(buildQuery(vehicleString, part));
  openURL(`https://www.autozone.com/searchresult?searchText=${q}`);
}

export function searchOReilly(vehicleString, part) {
  const q = encodeURIComponent(buildQuery(vehicleString, part));
  openURL(`https://www.oreillyauto.com/search?q=${q}`);
}

export function searchAmazon(vehicleString, part) {
  const q = encodeURIComponent(buildQuery(vehicleString, part));
  const tag = AMAZON_AFFILIATE_TAG
    ? `&tag=${encodeURIComponent(AMAZON_AFFILIATE_TAG)}`
    : '';
  openURL(`https://www.amazon.com/s?k=${q}${tag}`);
}

export function searchRockAuto(vehicleString, part) {
  const q = encodeURIComponent(buildQuery(vehicleString, part));
  openURL(`https://www.rockauto.com/en/partsearch/?partnum=${q}`);
}

export function searchYouTube(vehicleString, part) {
  const q = encodeURIComponent(
    `${buildQuery(vehicleString, part)} replacement how to`
  );
  openURL(`https://www.youtube.com/results?search_query=${q}`);
}