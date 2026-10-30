import { useRef, useState } from 'react';
import AddressSearch from '../../components/AddressSearch';
import RouteResult from '../../components/RouteResult';
import MapWrapper from '../MapWrapper';
import { searchAddresses, calculateRoute } from '../../utils/api';
import { insideMunicipality } from '../../utils/municipality';

const emptyPoints = () => ({ origin: null, destination: null });
const emptyFields = () => ({ origin: '', destination: '' });
const emptyResults = () => ({ origin: [], destination: [] });

export default function RoutePlanner() {
  const [points, setPoints] = useState(emptyPoints);
  const [queries, setQueries] = useState(emptyFields);
  const [results, setResults] = useState(emptyResults);
  const [trip, setTrip] = useState(null);
  const [picking, setPicking] = useState(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState({ message: 'Busque um endereço ou escolha um ponto no mapa.', error: false });
  const map = useRef(null);
  const locked = useRef(false);
  const notify = (message, error = false) => setStatus({ message, error });

  function changeQuery(kind, value) {
    setQueries((current) => ({ ...current, [kind]: value }));
    setResults((current) => ({ ...current, [kind]: [] }));
    setPoints((current) => ({ ...current, [kind]: null }));
    setTrip(null);
    setPicking(null);
  }

  function selectPoint(kind, point) {
    if (locked.current) return;
    setPicking(null);
    if (!insideMunicipality(point.coordinates)) { notify('Escolha um ponto dentro de Dois Vizinhos – PR.', true); return; }
    setPoints((current) => ({ ...current, [kind]: point }));
    setResults((current) => ({ ...current, [kind]: [] }));
    setTrip(null);
    notify('Ponto selecionado. Escolha o outro ponto ou calcule a rota.');
  }

  async function search(kind) {
    if (locked.current) return;
    if (queries[kind].trim().length < 3) { notify('Digite pelo menos três caracteres.', true); return; }
    locked.current = true;
    setBusy(true); setPicking(null);
    setResults((current) => ({ ...current, [kind]: [] }));
    notify('Buscando endereços…');
    try {
      const found = await searchAddresses(queries[kind]);
      setResults((current) => ({ ...current, [kind]: found }));
      notify(found.length ? 'Escolha um endereço na lista de resultados.' : 'Nenhum endereço encontrado em Dois Vizinhos. Confira o logradouro ou marque no mapa.');
    } catch (error) { notify('Não foi possível buscar o endereço. Tente novamente ou marque no mapa. ' + error.message, true); }
    finally { locked.current = false; setBusy(false); }
  }

  async function calculate() {
    if (locked.current || !points.origin || !points.destination) return;
    if (points.origin.coordinates.every((value, i) => Math.abs(value - points.destination.coordinates[i]) < 0.000001)) {
      notify('Escolha dois pontos diferentes para calcular uma rota.', true); return;
    }
    locked.current = true;
    setBusy(true); setPicking(null); setTrip(null);
    notify('Calculando o trajeto pelas ruas…');
    try {
      setTrip(await calculateRoute(points.origin, points.destination));
      notify('Rota calculada. Os pontos são conectados às vias acessíveis mais próximas.');
    } catch (error) { notify('Não foi possível calcular a rota. ' + error.message, true); }
    finally { locked.current = false; setBusy(false); }
  }

  function reset() {
    setPoints(emptyPoints()); setQueries(emptyFields()); setResults(emptyResults());
    setTrip(null); setPicking(null); map.current?.center();
    notify('Busque um endereço ou escolha um ponto no mapa.');
  }

  return <section className="col-lg-8 col-xl-9" aria-label="Calculadora de rota">
    <div className="card border-0 shadow-sm p-3 p-md-4 mb-3">
      <p id="address-help" className="small text-secondary">Atendimento exclusivo em Dois Vizinhos – PR. Digite duas letras para ver sugestões de logradouros; acrescente o número e clique em Buscar.</p>
      <div className="row g-3" aria-busy={busy}>
        {Object.keys(points).map((kind) => <AddressSearch key={kind} kind={kind} query={queries[kind]} point={points[kind]}
          results={results[kind]} busy={busy} onChange={changeQuery} onSearch={search} onSelect={selectPoint}
          onPick={(selected) => { setPicking(selected); notify(`Clique no mapa para marcar ${selected === 'origin' ? 'a origem (A).' : 'o destino (B).'}`); map.current?.focus(); }} />)}
      </div>
      <div className="d-flex flex-wrap gap-2 border-top pt-3 mt-2">
        <button type="button" className="btn btn-primary" disabled={busy || !points.origin || !points.destination} onClick={calculate}>{busy ? 'Aguarde…' : 'Calcular rota de carro'}</button>
        <button type="button" className="btn btn-outline-secondary" disabled={busy} onClick={reset}>Limpar</button>
        <button type="button" className="btn btn-light ms-md-auto" onClick={() => map.current?.center()}>Voltar a Dois Vizinhos</button>
      </div>
      <p role="status" aria-live="polite" className={`small mt-3 mb-0${status.error ? ' text-danger' : ''}`}>{status.message}</p>
      <RouteResult trip={trip} />
    </div>
    <MapWrapper ref={map} points={points} trip={trip} picking={picking}
      onPick={(kind, coordinates) => selectPoint(kind, { coordinates, name: `Ponto no mapa: ${coordinates[1].toFixed(5)}, ${coordinates[0].toFixed(5)}` })} />
    <p className="small text-secondary mt-2">Mapa: © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> · Busca: Nominatim · Rotas: OSRM</p>
  </section>;
}
