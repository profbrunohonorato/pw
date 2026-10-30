import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const origin = { coordinates: [-53.0577, -25.7469] };
const destination = { coordinates: [-53.06, -25.75] };
let api;
beforeEach(async () => { vi.resetModules(); api = await import('./api'); });
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
function respond(data) { vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => data })); }
function route() {
  return { code: 'Ok', routes: [{ distance: 500, duration: 90, geometry: { type: 'LineString', coordinates: [origin.coordinates, destination.coordinates] } }],
    waypoints: [{ location: origin.coordinates }, { location: destination.coordinates }] };
}

describe('Geocodificação e rotas', () => {
  it('restringe a busca à cidade, filtra outras cidades e reutiliza o cache', async () => {
    respond([{ lon: '-53.0577', lat: '-25.7469', display_name: 'Endereço local' }, { lon: '-49.27', lat: '-25.43', display_name: 'Curitiba' }]);
    const found = await api.searchAddresses('Avenida México');
    expect(found).toHaveLength(1);
    const url = new URL(fetch.mock.calls[0][0]);
    expect(url.searchParams.get('city')).toBe('Dois Vizinhos');
    expect(url.searchParams.get('bounded')).toBe('1');
    await api.searchAddresses('AVENIDA MÉXICO');
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('aceita uma rota local e recusa trajetos ou pontos ajustados fora da cidade', async () => {
    respond(route());
    expect((await api.calculateRoute(origin, destination)).distance).toBe(500);
    const external = route(); external.routes[0].geometry.coordinates.push([-49.27, -25.43]);
    respond(external);
    await expect(api.calculateRoute(origin, destination)).rejects.toThrow('sai de Dois Vizinhos');
    const snapped = route(); snapped.waypoints[0].location = [-49.27, -25.43]; respond(snapped);
    await expect(api.calculateRoute(origin, destination)).rejects.toThrow('sai de Dois Vizinhos');
  });
  it('explica falhas do servidor', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429 }));
    await expect(api.fetchJSON('https://example.org')).rejects.toThrow('Serviço ocupado');
  });
});
