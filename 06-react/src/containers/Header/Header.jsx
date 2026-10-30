export default function Header() {
  return (<header className="border-bottom bg-white">
    <div className="container py-3 d-flex align-items-center justify-content-between gap-3">
      <a className="brand text-decoration-none d-flex align-items-center gap-2" href="./"><img src={`${import.meta.env.BASE_URL}logo.svg`} width="40" height="40" alt="" />Rota Fácil</a>
      <span className="small text-secondary">Dois Vizinhos · PR</span>
    </div>
  </header>);
}
