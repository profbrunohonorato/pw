# 08 — Tópicos de Programação para Web

Quatro aplicações didáticas com HTML, CSS e JavaScript puro, sem React, compilação, dependências ou chaves externas. Abra [o índice](index.html) para navegar. Cada pasta contém seu próprio README com conceitos, experiências, exercícios, tutoriais e referências.

## Executar

Na raiz do repositório:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Acesse http://localhost:8000/08-topicos/. Use sempre a mesma origem: `localhost`, `127.0.0.1` e portas diferentes têm armazenamentos diferentes. Prefira HTTP local a `file://`, especialmente para cookies, IndexedDB e service workers. O Live Server também funciona.

| Pasta | Aplicação implementada | Tutorial no README |
| --- | --- | --- |
| [1-html-semantico-dns-seo](1-html-semantico-dns-seo/) | Página semântica, gerador de slug e exemplo de zona DNS | Domínios, registro, DNS, hospedagem, HTTPS, SEO e Search Console |
| [2-persistencia-frontend](2-persistencia-frontend/) | Salvar, ler e apagar notas em sessionStorage, localStorage, cookies e IndexedDB | Ciclos de vida, origem, índices, cotas e cookies de sessão do servidor |
| [3-seguranca-frontend](3-seguranca-frontend/) | Comparação de texto/HTML em sandbox, modelo de decisão CSRF e restauração manual de cookie | XSS, CSRF, SSRF, SQL Injection, MIME Sniffing, HTTP Request Smuggling, Zombie Cookie, reCAPTCHA, CDN e WAF |
| [4-tendencias-web-3](4-tendencias-web-3/) | Dialog, popover, Web Component, JSON-LD e exemplo offline opcional | Web semântica, Web3, carteiras, IPFS, PWA e evolução do HTML |

`assets/style.css` fornece o estilo compartilhado. Todos os exemplos funcionam sem carregar bibliotecas ou rastreadores externos; os links de documentação exigem internet. Nenhum serviço externo é contratado, configurado ou publicado automaticamente. Os controles de segurança que exigem servidor são explicados como tutoriais, sem fingir que uma validação no navegador protege um back-end.

## Sequência sugerida de aula

1. Execute o exemplo e leia o código-fonte.
2. Use a aba Elements e a árvore de acessibilidade para investigar o HTML.
3. Use Application/Storage para verificar persistência e service workers.
4. Use Network para comparar recursos, cabeçalhos e comportamento offline.
5. Siga os tutoriais de publicação em um ambiente de estudo sob seu controle.

O laboratório 2 só altera suas próprias chaves e sua nota no IndexedDB. O laboratório 3 só grava o exemplo de cookie quando solicitado e só o restaura por clique explícito. O laboratório 4 só registra um service worker após clicar em Ativar e inclui um botão para removê-lo. O worker tem escopo restrito à pasta 4 e não controla os outros laboratórios.

Referências técnicas consultadas em 30/10/2026. Compatibilidade de navegadores, painéis de provedores e políticas de serviços podem evoluir; os links em cada aula apontam para documentação primária.
