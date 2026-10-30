import GeoJSON from 'ol/format/GeoJSON';
import boundary from '../_assets/data/limite-municipal.json';

const municipality = new GeoJSON().readFeatures(boundary)[0].getGeometry();
export const bounds = municipality.getExtent();

export function insideMunicipality(coordinates) {
  return Array.isArray(coordinates) && coordinates.length === 2 &&
    coordinates.every(Number.isFinite) && municipality.intersectsCoordinate(coordinates);
}
