# Rota Fácil

Exemplo de serviço estático para a disciplina: estimar a distância de um deslocamento de carro para moradores. HTML, CSS, JavaScript puro e Bootstrap, sem compilação, cadastro ou back-end próprio. Atendimento exclusivo em Dois Vizinhos–PR, com seleção de pontos e rotas limitada ao município.

## Executar

Use o Live Server do VS Code nesta pasta ou, na raiz do repositório:

```sh
python3 -m http.server 8000
```

Abra http://localhost:8000/05-js/. A conexão com a internet é necessária para as bibliotecas, os mapas e as APIs. Prefira HTTP/HTTPS a abrir o arquivo diretamente, pois os arquivos JSON locais são carregados com fetch e o Nominatim exige identificação por Referer ou User-Agent.

## Usar

1. Digite pelo menos duas letras do logradouro para ver sugestões locais. Escolha uma, acrescente o número (opcional) e clique em Buscar. A pesquisa usa automaticamente Dois Vizinhos–PR.
2. Selecione explicitamente cada endereço encontrado. Somente resultados dentro do limite municipal podem ser selecionados.
3. Alternativamente, clique em “Marcar origem/destino no mapa” e depois no local desejado dentro de Dois Vizinhos.
4. Calcule a rota: a linha mostra o trajeto pelas vias, a distância vem em quilômetros e a duração é uma estimativa sem trânsito ao vivo.
5. “Limpar” reinicia a ferramenta. “Voltar a Dois Vizinhos” muda apenas a visualização.

## Organização e conceitos para a aula

- `index.html`: HTML semântico, formulários, Bootstrap, acessibilidade, SEO e Open Graph.
- `style.css`: identidade visual e ajustes responsivos.
- `app.js`: estado dos pontos, eventos, DOM seguro com `textContent`, Promises, `async/await`, `fetch`, tratamento de erros e GeoJSON.
- `assets/data/endereco.json`: nomes únicos de logradouros extraídos da lista de CEPs disponibilizada pelo Departamento de Gestão Urbana da Prefeitura de Dois Vizinhos; sugestões locais sem consultas externas durante a digitação. A lista é uma referência de sugestões, sem garantia de completude ou atualização permanente.
- `assets/data/limite-municipal.geojson`: limite de Dois Vizinhos ([IBGE, código 4107207](https://servicodados.ibge.gov.br/api/v3/malhas/municipios/4107207?formato=application/vnd.geo+json&qualidade=maxima)), usado para validar buscas, cliques, pontos ajustados pelo OSRM e coordenadas das rotas. Rotas que saem do município são recusadas.
- `logo.svg`: logo vetorial original, também usada como favicon.
- `favicon.png` e `apple-touch-icon.png`: versões raster do ícone.
- `social-preview.png`: cartão com logo de 1200 × 630 para compartilhamento.

Fluxo: endereço → Nominatim → longitude/latitude → OSRM → distância/duração/GeoJSON → OpenLayers. OpenStreetMap fornece o mapa e os dados; não é a API que calcula a rota. A API usa `[longitude, latitude]`; o mapa converte de EPSG:4326 para EPSG:3857.

## Serviços públicos

A configuração dos endpoints fica em `CONFIG` no início de `app.js`.

- [OpenLayers](https://openlayers.org/): exibe mapa, marcadores e rota.
- [OpenStreetMap](https://www.openstreetmap.org/copyright): dados e atribuição; respeite a [política de tiles](https://operations.osmfoundation.org/policies/tiles/).
- [Nominatim](https://operations.osmfoundation.org/policies/nominatim/): busca acionada por botão, com autocomplete exclusivamente local, com cache em memória e pelo menos 1,1 segundo entre requisições nesta página. O limite público de 1 requisição/segundo vale para a aplicação inteira, não por visitante: em uma turma, prefira marcar no mapa e evite buscas simultâneas. Para tráfego maior ou comercial, configure um provedor compatível com o volume. Não envie dados confidenciais.
- [OSRM](https://project-osrm.org/docs/v5.24.0/api/): servidor público de demonstração, sujeito a indisponibilidade. Os pontos são ajustados às vias acessíveis próximas; não há trânsito ao vivo. Não há fallback para distância em linha reta apresentado como rota.

O exemplo não usa geolocalização, cookies nem armazenamento persistente. Os serviços externos recebem as consultas/coordenadas e dados de conexão.

## Publicar e compartilhar

1. Envie os arquivos para o repositório.
2. No GitHub, habilite Settings → Pages → Deploy from a branch e selecione a branch e a pasta raiz.
3. O endereço previsto é `https://profbrunohonorato.github.io/pw/05-js/`. A publicação não é feita automaticamente por este exemplo.
4. Se hospedar em outro endereço, altere no `<head>` as URLs absolutas de `canonical`, `og:url`, `og:image`, `og:image:secure_url` e `twitter:image`. Ajuste também o site pessoal no rodapé para o de cada aluno.
5. Verifique se `social-preview.png` pode ser acessada publicamente por HTTPS. O WhatsApp lê título, descrição e imagem das tags Open Graph no HTML inicial. A prévia depende da publicação e do cache do aplicativo; localhost não gera uma prévia pública.

O espaço de publicidade é ilustrativo e não carrega anúncios nem rastreadores. Uma possibilidade de receita é patrocínio de negócios locais. O layout contém cabeçalho, ferramenta, anúncio, instruções e rodapé com link pessoal.

## Roteiro de verificação

- Digite parte de um logradouro, inclusive sem acentos, e confira as sugestões nos dois campos. Durante a digitação não deve haver chamadas ao Nominatim.
- Busque dois endereços e confira se cada um exige seleção na lista.
- Confira que endereços, cliques e trajetos fora de Dois Vizinhos são recusados.
- Edite um endereço selecionado e confira que a rota e a seleção anterior são invalidadas.
- Marque dois pontos próximos no mapa, calcule e confira linha, quilômetros e tempo.
- Troque um ponto: o resultado anterior deve desaparecer.
- Tente origem e destino iguais; teste busca inexistente e rede indisponível.
- Limpe a ferramenta; confira o mapa em uma tela estreita e navegue pelos formulários com Tab.
- Confira o favicon e o acesso público à imagem antes de compartilhar.

## Origem dos endereços e funcionamento do autocomplete

O autocomplete foi confeccionado a partir da base de CEPs de Dois Vizinhos–PR divulgada na matéria [Confira todos os novos CEPs de Dois Vizinhos, da Rádio Educadora](https://educadoradv.com.br/noticia/24812-confira-todos-os-novos-ceps-de-dois-vizinhos). A extração inicial usou essa publicação; depois, a lista foi conferida e refeita com o PDF da [Lista de CEPs da Prefeitura de Dois Vizinhos](https://drive.google.com/file/d/1Dm1ZY5r8V28QAqnJD6TLXejMZnWgspOC/view), disponibilizado pelo [Departamento de Gestão Urbana](https://doisvizinhos.pr.gov.br/secretarias/departamento-de-gestao-urbana). As fontes foram consultadas em 30/10/2026.

Para gerar `assets/data/endereco.json`, foram extraídos os nomes de logradouros das linhas da lista, retirados os CEPs e bairros, normalizados os espaços e removidos os nomes repetidos. Os 580 nomes resultantes foram ordenados alfabeticamente. O JSON também registra município, estado, código IBGE, fonte e data da consulta. Nomes também encontrados em outras cidades, como Avenida Batel e Avenida Silva Jardim, constam nessa lista de Dois Vizinhos.

Durante a digitação, a aplicação filtra esse arquivo local para apresentar sugestões. A comparação ignora diferenças entre letras maiúsculas e minúsculas e entre caracteres com e sem acentos. Nenhuma consulta ao Nominatim é feita nessa etapa. O arquivo contém nomes, sem coordenadas geográficas.

Ao clicar em **Buscar**, a aplicação consulta o **Nominatim**, uma API de busca de endereços com cobertura mundial baseada nos dados colaborativos do OpenStreetMap. Essa consulta procura converter o nome informado em uma localização, restringindo os resultados a Dois Vizinhos–PR.

É normal que algumas ruas de Dois Vizinhos não sejam encontradas pelo Nominatim, mesmo aparecendo no autocomplete. As duas etapas usam bases diferentes: as sugestões vêm da lista local de CEPs divulgada pela Rádio Educadora e conferida no PDF municipal; a localização depende do cadastro e da indexação no OpenStreetMap/Nominatim. Uma rua pode estar ausente nessa base mundial, ter outra grafia ou não ter números de imóveis cadastrados. Por isso, aparecer no autocomplete não garante um resultado na busca nem a localização exata de um número.

Quando isso acontecer, confira a grafia, tente buscar apenas o logradouro, sem o número, ou use **Marcar origem/destino no mapa** para escolher o ponto dentro do município.

## Atualizar os logradouros

Para atualizar, confira as fontes acima e substitua `logradouros` em `assets/data/endereco.json`, removendo duplicados e ordenando os nomes. Preserve os metadados de município e atualize a fonte e a data da consulta. Atualizar esse arquivo altera as sugestões locais; isso não cadastra nem atualiza ruas no OpenStreetMap ou no Nominatim.

É possível pesquisar um logradouro ausente na lista de sugestões, mas o resultado ainda precisa estar dentro do município.
