import { getBoundsOfCountryByIsoAlpha2Code } from 'osm-countries-bounds';
import { getEmojiFlag } from 'countries-list';

/**
 * trackerLocationToFeature
 * @param {object} location - Coronavirus Tracker location object
 */

export function trackerLocationToFeature(location = {}) {

  const { countryInfo = {} } = location;
  const { lat, long: lng, iso2 } = countryInfo;

  const countryCode = iso2;

  let countryBounds;
  let flag;

  if ( typeof countryCode === 'string' ) {
    countryBounds = getBoundsOfCountryByIsoAlpha2Code(countryCode);
    flag = getEmojiFlag(countryCode);
  }

  return {
    "type": "Feature",
    "properties": {
      ...location,
      countryCode,
      countryBounds,
      flag
    },
    "geometry": {
      "type": "Point",
      "coordinates": [ lng, lat ]
    }
  }
}

/**
 * trackerLocationsToGeoJson
 * @param {array} locations - Coronavirus Tracker location objects array
 */

export function trackerLocationsToGeoJson(locations = []) {
  if ( locations.length === 0 ) return;

  return {
    "type": "FeatureCollection",
    "features": locations.map((location = {}) => trackerLocationToFeature(location))
  }
}

/**
 * trackerFeatureToHtmlMarker
 */

export function trackerFeatureToHtmlMarker({ properties = {} } = {}) {
  const {
    country,
    anxious,
    flag,
    tweets,
    frustrated,
    happy,
    sad
  } = properties

  let tweetString = `${tweets}`;

  let happyColor = happy >= 0 ? "#4F8F00" : "#F2000D"
  let sadnessColor = sad >= 0 ? "#F2000D": "#4F8F00"
  let anxiousColor = anxious >= 0 ? "#F2000D": "#4F8F00"
  let frustrationColor = frustrated >= 0 ? "#F2000D": "#4F8F00"

  if ( tweets > 1000 ) {
    tweetString = `${tweetString.slice(0, -3)}k+`
  }

  return `
    <span class="icon-marker">
      <span class="icon-marker-tooltip">
        <h2>${flag} ${country}</h2>
        <ul>
          <li style=\"color:${happyColor};\"><strong>Happniess Change:</strong> ${happy}%</li>
          <li style=\"color:${sadnessColor};\"><strong>Sadness Change:</strong> ${sad}%</li>
          <li style=\"color:${anxiousColor};\"><strong>Anxious Change:</strong> ${anxious}%</li>
          <li style=\"color:${frustrationColor};\"><strong>Frustrated Change:</strong> ${frustrated}%</li>
        </ul>
      </span>
      ${ tweetString }
    </span>
  `;
}