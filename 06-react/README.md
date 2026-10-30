# Rota Fácil — React

Migração da aplicação `05-js` para React, mantendo a interface, os 580 logradouros do autocomplete local, a busca por endereço, a seleção no mapa e o cálculo de distância e tempo de carro. A seleção e as rotas continuam restritas a Dois Vizinhos–PR pelo limite municipal do IBGE.

## Executar

Requisitos: Node.js 20.19+ ou 22.12+ e npm, em versões compatíveis com o Vite instalado.

```sh
cd 06-react
npm ci
npm start
```

Abra http://127.0.0.1:5173/pw/06-react/. O Vite informa outra porta se a padrão estiver ocupada. A conexão com a internet é necessária para os tiles do mapa, a busca no Nominatim e as rotas do OSRM. Bootstrap, React, OpenLayers e os dados locais são instalados ou incluídos no projeto, sem scripts de bibliotecas via CDN.

```sh
npm test          # testes automatizados, executados uma vez
npm run build    # gera os arquivos estáticos em dist/
npm run preview  # serve o resultado da compilação localmente
```

A prévia abre em http://127.0.0.1:4173/pw/06-react/. Não abra o HTML diretamente por `file://`.

## Estrutura baseada no projeto pede

A organização segue `~/workspace/development/pede/`: recursos em `_assets`, configuração em `_config`, componentes reutilizáveis em `components`, estrutura da página em `containers`, funcionalidades em `features` e funções auxiliares em `utils`. Cada componente tem sua pasta e um `index.js` para exportação. Os arquivos com JSX usam a extensão `.jsx`.

```text
06-react/
├── public/                         # logo, ícones e imagem de compartilhamento
├── src/
│   ├── _assets/
│   │   ├── css/global.css
│   │   └── data/
│   │       ├── endereco.json
│   │       └── limite-municipal.json
│   ├── _config/map.js              # centro, zoom e URLs dos serviços
│   ├── components/
│   │   ├── AddressSearch/          # campo controlado, sugestões e resultados
│   │   └── RouteResult/            # distância e duração
│   ├── containers/
│   │   ├── Header/
│   │   ├── Footer/
│   │   └── Section/                # instruções e informações do serviço
│   ├── features/
│   │   ├── MapWrapper/             # ciclo de vida do OpenLayers e camadas
│   │   └── RoutePlanner/           # estado e ações da calculadora
│   ├── utils/
│   │   ├── addresses.js            # normalização e autocomplete local
│   │   ├── municipality.js         # validação pelo polígono municipal
│   │   └── api.js                  # fetch, timeout, cache, Nominatim e OSRM
│   ├── App.jsx
│   ├── index.jsx
│   └── setupTests.js
├── index.html                      # entrada HTML e metadados
├── package.json
├── package-lock.json
└── vite.config.js
```

A ferramenta de desenvolvimento é o Vite; o projeto de referência usa Create React App. A estrutura de responsabilidades foi preservada, adaptada ao tamanho desta aplicação. Os dados originais de `05-js` foram copiados sem alteração de conteúdo. O GeoJSON municipal recebe a extensão `.json` para importação direta no código.

## Como a versão React funciona

`RoutePlanner` mantém os campos, pontos selecionados, resultados, rota, modo de marcação e mensagens em `useState`. Os formulários são controlados pelo React e as listas são renderizadas a partir do estado. Alterar um campo remove a seleção e a rota anteriores; a busca exige seleção explícita de um resultado.

`MapWrapper` cria o OpenLayers em `useEffect`, conecta o mapa ao elemento HTML por `useRef` e atualiza marcadores e rota quando as propriedades mudam. Ao desmontar, libera o mapa e seus eventos. O componente expõe apenas centralização e foco por referência para a calculadora. O modo estrito do React está habilitado.

Fluxo: digitação → sugestões locais → botão Buscar → Nominatim → seleção de coordenadas → OSRM → distância/duração/GeoJSON → mapa. Não há chamadas ao Nominatim durante a digitação. As consultas explícitas usam cache em memória e intervalo mínimo de 1,1 segundo. O limite do serviço público vale para toda a aplicação, não para cada visitante; para uma turma, evite buscas simultâneas ou use marcação no mapa.

Resultados de busca e cliques fora do polígono municipal são recusados. As coordenadas da rota e os pontos ajustados pelo OSRM também são validados; trajetos que saem de Dois Vizinhos são recusados. O mapa usa OpenStreetMap e o limite municipal é fornecido pelo [IBGE, código 4107207](https://servicodados.ibge.gov.br/api/v3/malhas/municipios/4107207?formato=application/vnd.geo+json&qualidade=maxima).

As rotas são estimativas sem trânsito ao vivo, sujeitas à disponibilidade dos serviços públicos. Não há cadastro, cookies, geolocalização ou armazenamento persistente. Os serviços externos recebem as consultas/coordenadas e os dados de conexão. O espaço publicitário é ilustrativo.

## Verificação

Os testes usam Vitest e Testing Library, sem chamadas reais aos serviços externos. Cobrem sugestões sem acentos, limite municipal, filtro e cache de buscas, parâmetros da cidade, rejeição de rotas e pontos ajustados externos, falhas de rede, seleção dos pontos, apresentação de distância/tempo, invalidação ao editar e limpeza. O mapa é substituído por um componente de teste no fluxo da calculadora; a interação visual e os tiles devem ser conferidos no navegador.

Para conferir manualmente, busque e selecione dois pontos, marque pontos no mapa, calcule uma rota e edite um campo. Confira também ruas sem resultado, pontos iguais, limpeza, navegação por teclado e tela estreita.

## Publicar

`npm run build` gera `dist/`. Publique o conteúdo dessa pasta em `/pw/06-react/`; publicar apenas o código-fonte não compila a aplicação. Para GitHub Pages, use um processo de build e publicação que envie esse conteúdo. Nenhuma publicação é feita automaticamente pelo projeto.

O caminho-base fica em `vite.config.js`. Para outro domínio ou caminho, ajuste `base` e as URLs de `canonical`, Open Graph e Twitter em `index.html`. Os arquivos em `public/` são copiados para `dist/`, e o logo do cabeçalho usa o caminho-base configurado.

## Origem dos endereços e funcionamento do autocomplete

O autocomplete foi confeccionado a partir da base de CEPs de Dois Vizinhos–PR divulgada na matéria [Confira todos os novos CEPs de Dois Vizinhos, da Rádio Educadora](https://educadoradv.com.br/noticia/24812-confira-todos-os-novos-ceps-de-dois-vizinhos). A extração inicial usou essa publicação; depois, a lista foi conferida e refeita com o PDF da [Lista de CEPs da Prefeitura de Dois Vizinhos](https://drive.google.com/file/d/1Dm1ZY5r8V28QAqnJD6TLXejMZnWgspOC/view), disponibilizado pelo [Departamento de Gestão Urbana](https://doisvizinhos.pr.gov.br/secretarias/departamento-de-gestao-urbana). As fontes foram consultadas em 30/10/2026.

Para gerar `src/_assets/data/endereco.json`, foram extraídos os nomes de logradouros das linhas da lista, retirados os CEPs e bairros, normalizados os espaços e removidos os nomes repetidos. Os 580 nomes resultantes foram ordenados alfabeticamente. O JSON também registra município, estado, código IBGE, fonte e data da consulta. Nomes também encontrados em outras cidades, como Avenida Batel e Avenida Silva Jardim, constam nessa lista de Dois Vizinhos.

Durante a digitação, a aplicação filtra esse arquivo local para apresentar sugestões. A comparação ignora diferenças entre letras maiúsculas e minúsculas e entre caracteres com e sem acentos. Nenhuma consulta ao Nominatim é feita nessa etapa. O arquivo contém nomes, sem coordenadas geográficas.

Ao clicar em **Buscar**, a aplicação consulta o **Nominatim**, uma API de busca de endereços com cobertura mundial baseada nos dados colaborativos do OpenStreetMap. Essa consulta procura converter o nome informado em uma localização, restringindo os resultados a Dois Vizinhos–PR.

É normal que algumas ruas de Dois Vizinhos não sejam encontradas pelo Nominatim, mesmo aparecendo no autocomplete. As duas etapas usam bases diferentes: as sugestões vêm da lista local de CEPs divulgada pela Rádio Educadora e conferida no PDF municipal; a localização depende do cadastro e da indexação no OpenStreetMap/Nominatim. Uma rua pode estar ausente nessa base mundial, ter outra grafia ou não ter números de imóveis cadastrados. Por isso, aparecer no autocomplete não garante um resultado na busca nem a localização exata de um número.

Quando isso acontecer, confira a grafia, tente buscar apenas o logradouro, sem o número, ou use **Marcar origem/destino no mapa** para escolher o ponto dentro do município.

## Atualizar os logradouros

Para atualizar, confira as fontes acima e substitua `logradouros` em `src/_assets/data/endereco.json`, removendo duplicados e ordenando os nomes. Preserve os metadados de município e atualize a fonte e a data da consulta. Atualizar esse arquivo altera as sugestões locais; isso não cadastra nem atualiza ruas no OpenStreetMap ou no Nominatim.

É possível pesquisar um logradouro ausente na lista de sugestões, mas o resultado ainda precisa estar dentro do município.
