import { CONFIG } from '../_config/map';
import { bounds, insideMunicipality } from './municipality';

const cache = new Map();
let nextSearch = 0;

export async function fetchJSON(url) {
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

export async function searchAddresses(query) {
  const key = query.trim().toLocaleLowerCase('pt-BR');
  if (cache.has(key)) return cache.get(key);
  // Reserva o horário antes de esperar: chamadas concorrentes também respeitam o intervalo.
  const scheduled = Math.max(Date.now(), nextSearch);
  nextSearch = scheduled + 1100;
  await new Promise((resolve) => setTimeout(resolve, Math.max(0, scheduled - Date.now())));
  const url = new URL(CONFIG.searchUrl);
  url.search = new URLSearchParams({
    street: query.trim(), city: 'Dois Vizinhos', state: 'Paraná', country: 'Brasil',
    format: 'jsonv2', limit: '5', countrycodes: 'br', 'accept-language': 'pt-BR',
    viewbox: [bounds[0], bounds[3], bounds[2], bounds[1]].join(','), bounded: '1'
  });
  const data = await fetchJSON(url);
  if (!Array.isArray(data)) throw new Error('Resposta de busca inválida.');
  const results = data.map((place) => ({
    name: place.display_name, coordinates: [Number(place.lon), Number(place.lat)]
  })).filter((place) => insideMunicipality(place.coordinates));
  cache.set(key, results);
  return results;
}

export async function calculateRoute(origin, destination) {
  if (![origin, destination].every((point) => insideMunicipality(point.coordinates))) {
    throw new Error('Escolha pontos dentro de Dois Vizinhos.');
  }
  const coordinates = [origin, destination].map((point) => point.coordinates.join(',')).join(';');
  const data = await fetchJSON(CONFIG.routeUrl + coordinates + '?overview=full&geometries=geojson&steps=false');
  const trip = data.routes?.[0];
  if (data.code !== 'Ok' || !trip || !Number.isFinite(trip.distance) || !Number.isFinite(trip.duration) ||
      trip.geometry?.type !== 'LineString' || !Array.isArray(trip.geometry.coordinates) || trip.geometry.coordinates.length < 2) {
    throw new Error('Nenhuma rota de carro encontrada entre esses pontos.');
  }
  if (!trip.geometry.coordinates.every(insideMunicipality) || !Array.isArray(data.waypoints) ||
      data.waypoints.length !== 2 || !data.waypoints.every((point) => insideMunicipality(point.location))) {
    throw new Error('O trajeto sai de Dois Vizinhos. Escolha outros pontos no município.');
  }
  return trip;
}
