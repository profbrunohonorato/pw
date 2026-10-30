import { suggestAddresses } from '../../utils/addresses';

export default function AddressSearch({ kind, query, point, results, busy, onChange, onSearch, onSelect, onPick }) {
  const label = kind === 'origin' ? 'A · Origem' : 'B · Destino';
  return <div className="col-md-6">
    <form onSubmit={(event) => { event.preventDefault(); onSearch(kind); }}>
      <label htmlFor={`${kind}-query`} className="form-label fw-semibold">{label}</label>
      <div className="input-group">
        <input id={`${kind}-query`} className="form-control" list={`${kind}-suggestions`}
          aria-describedby="address-help" placeholder="Digite o logradouro" autoComplete="off"
          required minLength={3} maxLength={200} disabled={busy} value={query}
          onChange={(event) => onChange(kind, event.target.value)} />
        <button className="btn btn-outline-primary" type="submit" disabled={busy}>Buscar</button>
      </div>
    </form>
    <datalist id={`${kind}-suggestions`}>
      {suggestAddresses(query).map((street) => <option key={street} value={street} />)}
    </datalist>
    <div className="search-results" aria-label={`Resultados de ${kind === 'origin' ? 'origem' : 'destino'}`}>
      {results.map((place, index) => <button key={`${place.name}-${index}`} type="button"
        className="btn btn-light border w-100 mb-1" disabled={busy} onClick={() => onSelect(kind, place)}>{place.name}</button>)}
    </div>
    <p className="small text-secondary mt-2 mb-0">{point?.name || 'Nenhum ponto selecionado.'}</p>
    <button className="btn btn-sm btn-link px-0" type="button" disabled={busy} onClick={() => onPick(kind)}>
      Marcar {kind === 'origin' ? 'origem' : 'destino'} no mapa
    </button>
  </div>;
}
