export default function RouteResult({ trip }) {
  if (!trip) return null;
  const minutes = Math.max(1, Math.ceil(trip.duration / 60));
  const duration = minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
  return <div className="result mt-3">
    <div><span className="small d-block">DISTÂNCIA DA ROTA</span><strong>{new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(trip.distance / 1000)} km</strong></div>
    <div><span className="small d-block">TEMPO ESTIMADO</span><strong>{duration}</strong></div>
    <p className="small mb-0 w-100">Estimativa sem trânsito em tempo real. Confira os pontos e as condições das vias antes de sair.</p>
  </div>;
}
