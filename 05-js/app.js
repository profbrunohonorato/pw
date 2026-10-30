/* JavaScript puro: estado → eventos → APIs → atualização da interface. */
'use strict';

const CONFIG = {
  center: [-53.0577, -25.7469], // OpenLayers recebe longitude antes da latitude.
  zoom: 14,
  searchUrl: 'https://nominatim.openstreetmap.org/search',
  routeUrl: 'https://router.project-osrm.org/route/v1/driving/'
};
const $ = (id) => document.getElementById(id);
const points = { origin: null, destination: null };
let picking = null;
let busy = false;
let nextSearch = 0;
const cache = new Map();

if (!window.ol) {
  $('status').textContent = 'Não foi possível carregar o mapa. Confira a conexão e recarregue a página.';
  document.querySelectorAll('button').forEach((button) => { button.disabled = true; });
} else {
  start().catch((error) => {
    $('status').textContent = 'Não foi possível carregar os dados de Dois Vizinhos. Recarregue a página. ' + error.message;
    document.querySelectorAll('button, input').forEach((element) => { element.disabled = true; });
  });
}

async function start() {
  setBusy(true);
  const [addresses, boundary] = await Promise.all([
    fetchJSON('assets/data/endereco.json'),
    fetchJSON('assets/data/limite-municipal.geojson')
  ]);
  const municipality = new ol.format.GeoJSON().readFeatures(boundary)[0].getGeometry();
  const inside = (coordinates) => coordinates.every(Number.isFinite) && municipality.intersectsCoordinate(coordinates);
  const bounds = municipality.getExtent();
  const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
  const streets = addresses.logradouros;
  if (!Array.isArray(streets) || !streets.length) throw new Error('Lista de logradouros inválida.');
  const markers = new ol.source.Vector();
  const route = new ol.source.Vector();
  const map = new ol.Map({
    target: 'map',
    layers: [
      new ol.layer.Tile({ source: new ol.source.OSM() }),
      new ol.layer.Vector({ source: route, style: new ol.style.Style({
        stroke: new ol.style.Stroke({ color: '#185d50', width: 6 })
      }) }),
      new ol.layer.Vector({ source: markers })
    ],
    view: new ol.View({ center: ol.proj.fromLonLat(CONFIG.center), zoom: CONFIG.zoom, extent: ol.proj.transformExtent(bounds, 'EPSG:4326', 'EPSG:3857') })
  });

  function status(message, error = false) {
    $('status').textContent = message;
    $('status').classList.toggle('text-danger', error);
  }

  function setBusy(value) {
    busy = value;
    document.querySelectorAll('#search-fields button, #search-fields input, #reset, #calculate').forEach((button) => {
      button.disabled = value;
    });
    $('calculate').disabled = value || !points.origin || !points.destination;
    $('calculate').textContent = value ? 'Aguarde…' : 'Calcular rota de carro';
    $('search-fields').setAttribute('aria-busy', String(value));
  }

  function clearRoute() {
    route.clear();
    $('result').hidden = true;
  }

  function selectPoint(kind, coordinates, name) {
    if (busy) return;
    if (!inside(coordinates)) { status('Escolha um ponto dentro de Dois Vizinhos – PR.', true); return; }
    points[kind] = { coordinates, name };
    $(kind + '-selected').textContent = name;
    $(kind + '-results').replaceChildren();
    clearRoute();
    markers.clear();
    for (const [key, point] of Object.entries(points)) {
      if (!point) continue;
      const feature = new ol.Feature({ geometry: new ol.geom.Point(ol.proj.fromLonLat(point.coordinates)) });
      feature.set('kind', key);
      feature.setStyle(new ol.style.Style({
        image: new ol.style.Circle({ radius: 15, fill: new ol.style.Fill({ color: key === 'origin' ? '#185d50' : '#ad4c22' }), stroke: new ol.style.Stroke({ color: '#fff', width: 3 }) }),
        text: new ol.style.Text({ text: key === 'origin' ? 'A' : 'B', fill: new ol.style.Fill({ color: '#fff' }), font: 'bold 14px sans-serif' })
      }));
      markers.addFeature(feature);
    }
    map.getView().fit(markers.getExtent(), { padding: [60, 60, 60, 60], maxZoom: 16, duration: 400 });
    $('calculate').disabled = !points.origin || !points.destination;
    status('Ponto selecionado. ' + (points.origin && points.destination ? 'Agora calcule a rota.' : 'Escolha o outro ponto.'));
  }

  for (const kind of Object.keys(points)) {
    const input = $(kind + '-query');
    const suggestions = $(kind + '-suggestions');
    const autocomplete = () => {
      const query = normalize(input.value.trim());
      suggestions.replaceChildren();
      if (query.length < 2) return;
      for (const street of streets.filter((name) => normalize(name).includes(query)).slice(0, 20)) {
        const option = document.createElement('option');
        option.value = street;
        suggestions.append(option);
      }
    };
    input.addEventListener('input', () => {
      autocomplete();
      if (points[kind]) {
        points[kind] = null;
        $(kind + '-selected').textContent = 'Endereço alterado. Busque e selecione novamente.';
        markers.getFeatures().filter((feature) => feature.get('kind') === kind).forEach((feature) => markers.removeFeature(feature));
        clearRoute();
        $('calculate').disabled = true;
      }
      $(kind + '-results').replaceChildren();
    });
    $(kind + '-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      if (busy) return;
      const query = $(kind + '-query').value.trim();
      if (query.length < 3) { status('Digite pelo menos três caracteres.', true); return; }
      picking = null;
      $('map').classList.remove('picking');
      setBusy(true);
      $(kind + '-results').replaceChildren();
      status('Buscando endereços…');
      try {
        // Autocomplete local; geocodificação apenas ao enviar o formulário.
        let results = cache.get(query.toLocaleLowerCase('pt-BR'));
        if (!results) {
          await new Promise((resolve) => setTimeout(resolve, Math.max(0, nextSearch - Date.now())));
          nextSearch = Date.now() + 1100;
          const url = new URL(CONFIG.searchUrl);
          url.search = new URLSearchParams({ street: query, city: 'Dois Vizinhos', state: 'Paraná', country: 'Brasil', format: 'jsonv2', limit: '5', countrycodes: 'br', 'accept-language': 'pt-BR', viewbox: [bounds[0], bounds[3], bounds[2], bounds[1]].join(','), bounded: '1' });
          results = await fetchJSON(url);
          if (!Array.isArray(results)) throw new Error('Resposta de busca inválida.');
          cache.set(query.toLocaleLowerCase('pt-BR'), results);
        }
        for (const place of results) {
          const coordinates = [Number(place.lon), Number(place.lat)];
          if (!inside(coordinates)) continue;
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'btn btn-light border w-100 mb-1';
          button.textContent = place.display_name;
          button.addEventListener('click', () => selectPoint(kind, coordinates, place.display_name));
          $(kind + '-results').append(button);
        }
        status($(kind + '-results').childElementCount ? 'Escolha um endereço na lista de resultados.' : 'Nenhum endereço encontrado em Dois Vizinhos. Confira o logradouro ou marque no mapa.');
      } catch (error) {
        status('Não foi possível buscar o endereço. Tente novamente ou marque no mapa. ' + error.message, true);
      } finally { setBusy(false); }
    });
    $(kind + '-map').addEventListener('click', () => {
      picking = kind;
      $('map').classList.add('picking');
      status('Clique no mapa para marcar ' + (kind === 'origin' ? 'a origem (A).' : 'o destino (B).'));
      $('map').focus({ preventScroll: true });
      $('map').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  map.on('singleclick', (event) => {
    if (!picking || busy) return;
    const coordinates = ol.proj.toLonLat(event.coordinate);
    const kind = picking;
    picking = null;
    $('map').classList.remove('picking');
    selectPoint(kind, coordinates, `Ponto no mapa: ${coordinates[1].toFixed(5)}, ${coordinates[0].toFixed(5)}`);
  });

  $('calculate').addEventListener('click', async () => {
    if (busy || !points.origin || !points.destination) return;
    if (points.origin.coordinates.every((value, i) => Math.abs(value - points.destination.coordinates[i]) < 0.000001)) {
      status('Escolha dois pontos diferentes para calcular uma rota.', true); return;
    }
    picking = null;
    $('map').classList.remove('picking');
    setBusy(true);
    clearRoute();
    status('Calculando o trajeto pelas ruas…');
    try {
      const coordinates = [points.origin, points.destination].map((point) => point.coordinates.join(',')).join(';');
      const data = await fetchJSON(CONFIG.routeUrl + coordinates + '?overview=full&geometries=geojson&steps=false');
      const trip = data.routes?.[0];
      if (data.code !== 'Ok' || !trip || !Number.isFinite(trip.distance) || !Number.isFinite(trip.duration) || trip.geometry?.type !== 'LineString') {
        throw new Error('Nenhuma rota de carro encontrada entre esses pontos.');
      }
      if (!trip.geometry.coordinates.every(inside) || !data.waypoints?.every((point) => inside(point.location))) {
        throw new Error('O trajeto sai de Dois Vizinhos. Escolha outros pontos no município.');
      }
      const feature = new ol.format.GeoJSON().readFeature({ type: 'Feature', geometry: trip.geometry, properties: {} }, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });
      route.addFeature(feature);
      map.getView().fit(feature.getGeometry().getExtent(), { padding: [50, 50, 50, 50], maxZoom: 16, duration: 500 });
      $('distance').textContent = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(trip.distance / 1000) + ' km';
      const minutes = Math.max(1, Math.ceil(trip.duration / 60));
      $('duration').textContent = minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
      $('result').hidden = false;
      status('Rota calculada. Os pontos são conectados às vias acessíveis mais próximas.');
    } catch (error) {
      status('Não foi possível calcular a rota. ' + error.message, true);
    } finally { setBusy(false); }
  });

  setBusy(false);

  function center() { map.getView().animate({ center: ol.proj.fromLonLat(CONFIG.center), zoom: CONFIG.zoom, duration: 400 }); }
  $('center').addEventListener('click', center);
  $('reset').addEventListener('click', () => {
    for (const kind of Object.keys(points)) {
      points[kind] = null;
      $(kind + '-form').reset();
      $(kind + '-suggestions').replaceChildren();
      $(kind + '-results').replaceChildren();
      $(kind + '-selected').textContent = 'Nenhum ponto selecionado.';
    }
    picking = null;
    $('map').classList.remove('picking');
    markers.clear();
    clearRoute();
    setBusy(false);
    center();
    status('Busque um endereço ou escolha um ponto no mapa.');
  });
}

async function fetchJSON(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(response.status === 429 ? 'Serviço ocupado. Aguarde um pouco.' : `Serviço indisponível (HTTP ${response.status}).`);
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('O serviço demorou para responder.');
    throw error;
  } finally { clearTimeout(timeout); }
}
