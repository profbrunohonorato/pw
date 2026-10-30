import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import GeoJSON from 'ol/format/GeoJSON';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import { Circle, Fill, Stroke, Style, Text } from 'ol/style';
import { fromLonLat, toLonLat, transformExtent } from 'ol/proj';
import { CONFIG } from '../../_config/map';
import { bounds } from '../../utils/municipality';
import './MapWrapper.css';

const MapWrapper = forwardRef(function MapWrapper({ points, trip, picking, onPick }, ref) {
  const target = useRef(null);
  const instance = useRef(null);
  const latest = useRef({ picking, onPick });
  useEffect(() => { latest.current = { picking, onPick }; }, [picking, onPick]);

  useImperativeHandle(ref, () => ({
    center() { instance.current?.map.getView().animate({ center: fromLonLat(CONFIG.center), zoom: CONFIG.zoom, duration: 400 }); },
    focus() { target.current?.focus({ preventScroll: true }); target.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  }), []);

  useEffect(() => {
    const markers = new VectorSource();
    const route = new VectorSource();
    const map = new Map({
      target: target.current,
      layers: [new TileLayer({ source: new OSM() }),
        new VectorLayer({ source: route, style: new Style({ stroke: new Stroke({ color: '#185d50', width: 6 }) }) }),
        new VectorLayer({ source: markers })],
      view: new View({ center: fromLonLat(CONFIG.center), zoom: CONFIG.zoom,
        extent: transformExtent(bounds, 'EPSG:4326', 'EPSG:3857') })
    });
    map.on('singleclick', (event) => {
      const { picking: kind, onPick: handler } = latest.current;
      if (kind) handler(kind, toLonLat(event.coordinate));
    });
    instance.current = { map, markers, route };
    return () => { map.setTarget(undefined); map.dispose(); instance.current = null; };
  }, []);

  useEffect(() => {
    const { map, markers } = instance.current;
    markers.clear();
    for (const [kind, point] of Object.entries(points)) {
      if (!point) continue;
      const feature = new Feature({ geometry: new Point(fromLonLat(point.coordinates)) });
      feature.setStyle(new Style({
        image: new Circle({ radius: 15, fill: new Fill({ color: kind === 'origin' ? '#185d50' : '#ad4c22' }), stroke: new Stroke({ color: '#fff', width: 3 }) }),
        text: new Text({ text: kind === 'origin' ? 'A' : 'B', fill: new Fill({ color: '#fff' }), font: 'bold 14px sans-serif' })
      }));
      markers.addFeature(feature);
    }
    if (markers.getFeatures().length) map.getView().fit(markers.getExtent(), { padding: [60, 60, 60, 60], maxZoom: 16, duration: 400 });
  }, [points]);

  useEffect(() => {
    const { map, route } = instance.current;
    route.clear();
    if (!trip) return;
    const feature = new GeoJSON().readFeature({ type: 'Feature', geometry: trip.geometry, properties: {} }, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });
    route.addFeature(feature);
    map.getView().fit(feature.getGeometry().getExtent(), { padding: [50, 50, 50, 50], maxZoom: 16, duration: 500 });
  }, [trip]);

  return <div id="map" ref={target} className={`shadow-sm${picking ? ' picking' : ''}`} tabIndex={0} role="region"
    aria-label="Mapa interativo de Dois Vizinhos. Use os botões de busca como alternativa à seleção no mapa." />;
});
export default MapWrapper;
