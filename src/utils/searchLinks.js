import { Linking } from 'react-native';

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