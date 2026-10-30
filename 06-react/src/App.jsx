import Header from './containers/Header';
import Footer from './containers/Footer';
import Section from './containers/Section';
import RoutePlanner from './features/RoutePlanner';

export default function App() {
  return <>
    <Header />
    <main className="container py-4 py-lg-5">
      <div className="mb-4">
        <p className="eyebrow mb-2">PARA QUEM PRECISA PLANEJAR UM DESLOCAMENTO</p>
        <h1 className="fw-bold">Quantos quilômetros até lá?</h1>
        <p className="text-secondary mb-0">Escolha a origem e o destino em Dois Vizinhos – PR. Veja a distância pelas ruas e o tempo estimado de carro.</p>
      </div>
      <div className="row g-4">
        <RoutePlanner />
        <aside className="col-lg-4 col-xl-3" aria-label="Publicidade">
        <div className="ad-slot"><span className="eyebrow">ESPAÇO PUBLICITÁRIO</span><div className="ad-box"><strong>Sua marca no caminho</strong><span>Anuncie seu negócio local</span><small>300 × 250 · demonstração</small></div><p className="small text-secondary mb-0">Área reservada para um futuro parceiro comercial.</p></div>
      </aside>
      </div>
      <Section />
    </main>
    <Footer />
  </>;
}
