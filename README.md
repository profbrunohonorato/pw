# Programação para Web 1 --- Exemplos

Repositório de exemplos utilizados na disciplina **Programação para Web
1 (PW14SW)**, do curso de **Engenharia de Software --- UTFPR, Campus
Dois Vizinhos**.

O objetivo deste repositório é reunir os códigos desenvolvidos e
demonstrados durante as aulas. Os exemplos acompanham a evolução da
disciplina, dos fundamentos da Web até o desenvolvimento de aplicações
front-end com React.

## Conteúdos

Os exemplos serão organizados de acordo com os assuntos trabalhados ao
longo da disciplina:

-   funcionamento da Web e arquitetura cliente-servidor;
-   HTML;
-   CSS;
-   layouts e responsividade;
-   JavaScript;
-   manipulação do DOM;
-   eventos e interação com o usuário;
-   HTTP e consumo de APIs;
-   React;
-   componentes, propriedades e estado;
-   hooks;
-   roteamento;
-   organização de aplicações front-end;
-   publicação de aplicações Web.

> O repositório será atualizado progressivamente durante o semestre.

## Organização do repositório

Cada aula ou assunto possui seu próprio diretório:

``` text
.
├── 01-intro/
├── 02-html/
├── 03-css/
├── 04-layout/
├── 05-js/
├── 06-react/
├── 07-site-pessoal/
├── 08-requisicoes/
├── 09-topicos/
├── experimento/
└── index.html
```

## Implementações de 30/10/2026

### Rota Fácil: JavaScript e React

O [Rota Fácil em JavaScript](05-js/README.md) permite buscar endereços ou marcar origem e destino no mapa para calcular distância e duração estimada de um deslocamento de carro em Dois Vizinhos–PR. O exemplo combina HTML, CSS, Bootstrap, manipulação do DOM, eventos, `fetch`, Promises e `async/await`, sem back-end próprio ou compilação.

Foram incluídos 580 logradouros para sugestões locais, extraídos da lista de CEPs e conferidos no PDF municipal, além do limite municipal do IBGE em GeoJSON. O autocomplete ignora diferenças de acentuação e não faz consultas externas durante a digitação. A busca por coordenadas usa Nominatim; o cálculo do trajeto usa OSRM; o mapa usa OpenLayers e dados do OpenStreetMap. A seleção de pontos e os trajetos são validados pelo limite municipal. Uma sugestão local não garante que o endereço esteja cadastrado no Nominatim; a marcação no mapa oferece outra forma de selecionar o ponto.

A interface inclui tratamento de erros, limpeza e invalidação da rota ao alterar um ponto, layout responsivo, logo, favicons e imagem de compartilhamento com metadados de SEO e Open Graph. Consulte as limitações e orientações de uso dos serviços públicos no README da aplicação. [Abrir a versão JavaScript](05-js/index.html).

A [versão React](06-react/README.md) migra a mesma ferramenta para React e Vite, com componentes reutilizáveis, containers, funcionalidades, configuração e funções auxiliares. O estado e os formulários são controlados pelo React; hooks integram o ciclo de vida do mapa. Os dados locais e as restrições municipais foram preservados. Foram adicionados testes com Vitest e Testing Library para autocomplete, APIs, validações e fluxo da calculadora, além dos comandos de desenvolvimento, compilação e prévia.

### Requisições HTTP e previsão do tempo

O [laboratório Tempo de Requisição](08-requisicoes/README.md) consulta localidades e apresenta condições atuais e previsão de cinco dias usando a Open-Meteo. Permite comparar Fetch com `async/await`, Fetch com `.then()`, XMLHttpRequest e navegação por submit HTML. O diário de requisições mostra URL, método, duração, status, tipo de conteúdo e resposta, com cancelamento, timeout e tratamento de falhas.

O material explica HTTP, AJAX, Promises, métodos, status, protocolos, sockets e servidores web. Configurações que exigem infraestrutura, como HTTPS e servidores, estão documentadas como tutoriais. [Abrir o laboratório HTTP](08-requisicoes/index.html).

### Quatro laboratórios de tópicos complementares

Os exemplos de [09-topicos](09-topicos/README.md) usam HTML, CSS e JavaScript puro, com estilo compartilhado e READMEs contendo conceitos, experiências, exercícios e referências. [Abrir o índice dos laboratórios](09-topicos/index.html).

| Laboratório | Implementação e conteúdo |
| --- | --- |
| [HTML semântico, DNS e SEO](09-topicos/1-html-semantico-dns-seo/README.md) | Página semântica, gerador de slug e exemplo de zona DNS; tutoriais de domínio, hospedagem, HTTPS, SEO e Search Console. |
| [Persistência no front-end](09-topicos/2-persistencia-frontend/README.md) | Salvar, ler e apagar notas em sessionStorage, localStorage, cookies e IndexedDB; comparação de origem, duração e organização dos dados. |
| [Segurança no front-end](09-topicos/3-seguranca-frontend/README.md) | Comparação de texto e HTML em sandbox, modelo de decisão CSRF e restauração manual de cookie; explicações de XSS, SSRF, SQL Injection, MIME Sniffing, HTTP Request Smuggling e Zombie Cookie, além de tutoriais de reCAPTCHA, CDN e WAF. |
| [Tendências e Web 3.0](09-topicos/4-tendencias-web-3/README.md) | Dialog, popover, details, Web Component e JSON-LD; manifesto e service worker opcional para experiência offline, com tutoriais de PWA, IPFS e carteiras Web3. |

Os controles de segurança que dependem de servidor são tratados nos tutoriais. O service worker só é ativado por ação do usuário e fica restrito à pasta do quarto laboratório.

### Organização e arquivos do projeto

- A pasta `07-trabalho-1` foi renomeada para [07-site-pessoal](07-site-pessoal/nota-de-aula.md), preservando as três etapas: HTML puro, CSS e mobile first.
- Foi incluído um exemplo simples de tabela no `index.html` da raiz.
- Foi adicionado um `.gitignore` geral para dependências, compilações, cobertura, configurações e credenciais locais, logs e arquivos temporários.
- Arquivos auxiliares de documento e a antiga entrada `.aws` foram retirados do versionamento.

## Como utilizar os exemplos

Clone o repositório:

``` bash
git clone https://github.com/profbrunohonorato/pw.git
cd pw
```

Depois, acesse o diretório correspondente à aula desejada.

Para os exemplos de **HTML, CSS e JavaScript puro**, utilize o **Live Server** do Visual Studio Code ou execute na raiz:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Acesse `http://localhost:8000/05-js/`, `http://localhost:8000/08-requisicoes/` ou `http://localhost:8000/09-topicos/`. Use HTTP local para carregar JSON, testar persistência e registrar service workers. Para comparar dados persistidos, mantenha o mesmo host e porta.

Para a aplicação **React**, utilize Node.js compatível com o campo `engines` de `06-react/package.json` e execute:

``` bash
cd 06-react
npm ci
npm start
```

Acesse `http://127.0.0.1:5173/pw/06-react/` ou a porta informada pelo Vite. Na mesma pasta, `npm test` executa os testes, `npm run build` gera `dist/` e `npm run preview` serve a compilação localmente. Consulte o [guia React](06-react/README.md) para detalhes.

O Rota Fácil e o laboratório de previsão precisam de internet para consultar serviços externos. Para publicar React, use o conteúdo compilado de `dist/` no caminho configurado em `vite.config.js`. Os exemplos estáticos podem ser servidos diretamente; os guias locais explicam os ajustes de publicação e compartilhamento. Nenhuma publicação é executada automaticamente.

## Exemplos não são soluções finais

Os códigos deste repositório possuem finalidade **didática**.

Alguns exemplos são propositalmente pequenos ou simplificados para
destacar um conceito específico. Portanto, eles não devem ser
interpretados automaticamente como uma arquitetura completa ou como a
única forma de resolver determinado problema.

A recomendação é:

1.  execute o exemplo;
2.  altere o código;
3.  observe o resultado;
4.  consulte a documentação;
5.  tente reproduzir o conceito sem copiar o exemplo.

## Documentação recomendada

Durante a disciplina, utilize documentação técnica como parte do
processo de desenvolvimento.

-   **MDN Web Docs** --- HTML, CSS, JavaScript, DOM e APIs da Web;
-   **React Documentation** --- documentação oficial do React;
-   **W3Schools** --- ambiente útil para experimentação rápida de
    exemplos introdutórios.

## Ferramentas

Ao longo das aulas, poderão ser utilizadas:

-   Visual Studio Code;
-   Git e GitHub;
-   navegador e DevTools;
-   Node.js e npm;
-   React;
-   GitHub Pages.

## Professor

**Prof. Dr. Bruno de Castro Honorato Silva**\
Universidade Tecnológica Federal do Paraná --- UTFPR\
Campus Dois Vizinhos

------------------------------------------------------------------------

> **Programação para Web 1**\
> Aprenda os fundamentos. Experimente no navegador. Modifique o código.
> Construa para a Web.
