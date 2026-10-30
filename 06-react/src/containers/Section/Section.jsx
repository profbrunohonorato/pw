export default function Section() {
  return (<section className="row g-4 mt-3" aria-labelledby="instructions">
      <div className="col-md-6"><h2 id="instructions" className="h5">Como calcular</h2><ol className="text-secondary ps-3"><li>Digite o logradouro, escolha uma sugestão e acrescente o número, se houver. Clique em Buscar.</li><li>Escolha o resultado correto para cada ponto.</li><li>Clique em Calcular rota de carro.</li></ol><p className="small text-secondary">Você também pode usar os botões de marcação e clicar no mapa. A rota acompanha as vias disponíveis, por isso pode ser maior que a distância em linha reta.</p></div>
      <div className="col-md-6"><h2 className="h5">Um serviço pequeno, uma tarefa resolvida</h2><p className="text-secondary">Uma ferramenta para moradores que precisam estimar um deslocamento de carro. Gratuita, sem cadastro e sem instalação.</p><p className="small text-secondary">Os endereços e pontos escolhidos são enviados aos serviços públicos de busca e rota. O mapa carrega imagens do OpenStreetMap. A disponibilidade depende desses serviços e da sua conexão.</p></div>
    </section>);
}
