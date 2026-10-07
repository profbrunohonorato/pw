# Programação para Web 1

## Etapa 3: Site pessoal Mobile First com CSS Grid

Prof. Bruno Honorato  
UTFPR - Campus Dois Vizinhos  
Outubro, 2026

## 1. Objetivo e requisitos

O objetivo desta versão é reconstruir o site segundo a estratégia Mobile First, configurar o viewport, evitar larguras rígidas, utilizar unidades adequadas, organizar o layout com Grid e acrescentar media queries para telas maiores. A imagem e os controles devem respeitar a largura disponível. A avaliação pede a conferência de navegação, texto e formulário em pelo menos três larguras.

O conteúdo pessoal e a ordem do HTML são os mesmos das etapas anteriores. Não há JavaScript, frameworks ou envio de formulário. Este README documenta a evolução, incluída na nota consolidada em `../nota-de-aula.pdf`.

## 2. Arquivos e execução

```text
03-mobile-first/
├── index.html
├── estilos.css
├── imagens/
│   └── bruno-honorato.jpg
└── README.md
```

Abra `index.html` no navegador. A folha de estilos e a fotografia são locais, e não há dependências para executar o exemplo. Cada etapa permanece independente para facilitar a comparação.

Aluno/autor do exemplo: Bruno de Castro Honorato Silva. Objetivo: adaptar a apresentação do site a diferentes larguras com Mobile First e CSS Grid. Link do site publicado: pendente; não foi realizada publicação no GitHub Pages nesta tarefa.

## 3. HTML e viewport

Nenhuma nova tag foi necessária para criar a grade. `main` já contém as seis `section` que serão seus itens; `nav` já contém a lista `ul`, cujos filhos `li` serão os itens da grade de navegação. O HTML foi preservado, com alteração apenas do título da aba para identificar a versão responsiva.

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="estilos.css">
```

`meta` configura o viewport: `width=device-width` aproxima sua largura em pixels CSS da largura do dispositivo, e `initial-scale=1.0` define a escala inicial. Sem essa configuração, navegadores móveis podem usar um viewport virtual amplo e reduzir a página, prejudicando a adaptação. Não bloqueamos o zoom.

`link` mantém a separação entre estrutura e apresentação: `rel="stylesheet"` identifica a folha e `href` indica seu caminho. `header`, `nav`, `main`, `section`, `article`, `figure`, `footer` e os elementos do formulário conservam os mesmos significados da [etapa 1](../01-html-puro/README.md). CSS Grid altera a distribuição das caixas, sem mudar a semântica das tags.

Os IDs `sobre`, `formacao`, `experiencias`, `habilidades`, `perfis` e `contato` continuam sendo destinos do menu. Alguns também passam a ser selecionados no CSS para determinar a extensão na grade. Um atributo `id` pertence ao HTML; `#contato` em uma regra CSS é um seletor; `href="#contato"` é uma âncora. São usos relacionados, com funções diferentes.

## 4. Mobile First e breakpoints

As regras fora das media queries são a versão de celular: espaçamento externo de `1rem`, títulos menores, menu em uma coluna e conteúdo em uma coluna. Essa é a experiência inicial, não uma versão desktop reduzida por exceções.

| Largura de referência | Regras ativas com fonte inicial de 16 px | Menu | Conteúdo |
| --- | --- | --- | --- |
| 375 px | Base | 1 coluna | 1 coluna |
| 768 px | Base + `min-width: 48rem` | 3 colunas | 2 colunas |
| 1200 px | Base + ambas as media queries | 6 colunas | 3 colunas |

`48rem` corresponde aproximadamente a 768 px, e `75rem` a 1200 px quando a fonte inicial do navegador é 16 px. Nas media queries, `rem` se refere ao tamanho inicial da fonte, não a uma alteração de `font-size` aplicada por CSS ao documento. Configurações do usuário podem mudar essa equivalência.

Escolhemos o primeiro breakpoint para permitir dois blocos de leitura e três links por linha; o segundo abre espaço para três blocos e seis links por linha. São decisões deste conteúdo, não regras universais sobre dispositivos. O limite global de `72rem` evita que linhas de texto cresçam indefinidamente em monitores maiores.

Em 1200 px, as duas queries estão ativas. A de desktop aparece depois e substitui propriedades também definidas na de tablet, como a quantidade de colunas e o padding dos blocos centrais. As cores, bordas e regras que ela não altera continuam valendo.

## 5. Por que a grade funciona

```css
main {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
}

@media (min-width: 48rem) {
  main {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.5rem;
  }
  #sobre, #contato {
    grid-column: 1 / -1;
  }
}

@media (min-width: 75rem) {
  main {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  #experiencias, #contato {
    grid-column: span 2;
  }
}
```

`display: grid` transforma `main` em contêiner. Somente seus filhos diretos, as seis seções, viram itens dessa grade; os artigos dentro da seção de experiências continuam no fluxo normal.

`1fr` representa uma fração do espaço disponível, depois de considerar os intervalos. `repeat(2, ...)` e `repeat(3, ...)` criam colunas de mesma flexibilidade sem repetir manualmente a definição. `minmax(0, 1fr)` permite que a largura mínima de cada trilha seja zero, evitando que o mínimo intrínseco de um conteúdo longo force a grade a ultrapassar o contêiner. `min-width: 0` nas seções complementa essa decisão ao permitir que o próprio item encolha.

`gap` fornece espaço entre linhas e colunas. Por isso, removemos a antiga margem inferior das seções; manter as duas formas de separação somaria espaços desnecessários. `align-items: start` alinha os blocos no início de cada linha e evita esticar um bloco curto até a altura do vizinho. A altura de cada linha ainda é determinada pelo item mais alto, podendo haver espaço abaixo de uma seção mais curta.

`grid-column: 1 / -1` vai da primeira até a última linha explícita de colunas, cobrindo toda a largura. `grid-column: span 2` ocupa duas colunas a partir da posição definida pela colocação automática. No desktop, a regra de `#contato` substitui sua extensão de largura total definida no tablet. `#sobre` mantém a extensão total porque nenhuma regra posterior a substitui.

Distribuição esperada, seguindo a ordem do documento:

```text
Celular (1 coluna):
Sobre
Formação
Experiências
Habilidades
Perfis
Contato

Tablet (2 colunas):
Sobre       | Sobre
Formação    | Experiências
Habilidades | Perfis
Contato     | Contato

Desktop (3 colunas):
Sobre       | Sobre        | Sobre
Formação    | Experiências | Experiências
Habilidades | Perfis       | espaço livre
Contato     | Contato      | espaço livre
```

Repetir um nome no esquema indica a extensão de um único bloco, não conteúdo duplicado. Os espaços livres do desktop são intencionais: o contato precisa de duas colunas e não cabe na coluna restante da linha anterior. A colocação automática padrão avança para a próxima linha. Não usamos `grid-auto-flow: dense` para preencher esse espaço, pois isso poderia colocar visualmente conteúdos posteriores antes de outros e dificultar a correspondência com a leitura e a navegação por teclado.

A navegação é outra grade, independente de `main`. Seu contêiner é `nav ul`; os seis `li` passam de uma para três e depois seis colunas. Isso dá caixas de largura consistente aos links. `nav a` é um bloco que preenche a largura do item e tem altura mínima de `2.75rem`, aproximadamente 44 px na configuração padrão, ampliando a área de interação. Não há menu escondido que dependa de JavaScript.

## 6. Seletores e finalidade de cada regra

A tabela cobre os seletores da folha de estilos. As regras repetidas nas media queries são detalhadas logo depois. Vírgulas agrupam alvos; espaço seleciona descendentes; `>` seleciona filhos diretos; `+` seleciona irmãos consecutivos; pseudoclasses selecionam estados ou posições.

| Seletor | Por que é usado |
| --- | --- |
| `*` | Aplica `border-box` a todos os elementos, incluindo padding e bordas nas larguras declaradas. |
| `body` | Define fundo, cor, fonte e altura de linha; remove a margem padrão. `overflow-wrap: anywhere` permite quebrar conteúdo textual longo quando falta espaço. |
| `header, main, footer` | Usa `width: 100%`, largura máxima de `72rem`, margens automáticas e padding móvel de `1rem` para alinhar os blocos centrais sem largura rígida. |
| `header` | Preserva o fundo escuro, texto claro, alinhamento central e borda dourada da apresentação. |
| `h1, h2, h3` | Compartilha uma altura de linha compacta para títulos que precisem quebrar. |
| `h1` | Aplica tamanho móvel de `1.8rem` e margem inferior; cresce no tablet. |
| `header > p` | Estiliza somente a apresentação direta do cabeçalho, limitando seu comprimento de linha e aplicando texto claro. |
| `figure` | Remove recuos padrão e separa a fotografia do menu. |
| `figure img` | Aplica largura de `12rem`, `max-width: 100%` e `height: auto`, preservando proporção e permitindo encolher. Centraliza a imagem como bloco e mantém retrato circular com borda dourada. |
| `figcaption` | Separa a legenda da foto e usa tamanho menor e texto claro. |
| `nav ul` | Cria a grade de links, inicialmente de uma coluna, com `gap: 0.5rem`, sem marcadores ou recuos. |
| `nav a` | Usa bloco, padding, altura mínima, borda e cantos arredondados para oferecer uma área clicável clara. |
| `nav a:hover` | Inverte fundo e texto quando o ponteiro passa sobre um destino do menu. |
| `main` | Cria a grade das seções, inicialmente de uma coluna, com gap e alinhamento no início das linhas. |
| `main > section` | Faz cada seção encolher com `min-width: 0` e delimita o bloco com padding, fundo branco, borda e arredondamento. A separação entre seções é responsabilidade do gap da grade. |
| `h2` | Marca cada seção com borda lateral, padding, margem inferior e tamanho móvel de `1.4rem`, ampliado no tablet. |
| `h3` | Apresenta o título de cada projeto em tamanho subordinado ao título da seção. |
| `p` | Normaliza a margem dos parágrafos, preservando a distância inferior. |
| `main ul` | Mantém o recuo dos marcadores nas listas de conteúdo. |
| `main li + li` | Separa itens consecutivos sem acrescentar espaço antes do primeiro. |
| `article` | Delimita cada experiência com fundo claro, padding e borda lateral, sem transformá-la em uma nova grade. |
| `article + article` | Separa experiências consecutivas dentro da seção. |
| `article > p` | Remove a margem inferior do parágrafo direto; o padding do artigo já fornece espaço final. |
| `a` | Aplica cor aos links em geral e afasta o sublinhado do texto. |
| `a:hover` | Aumenta a espessura do sublinhado quando ele está visível. |
| `a:focus-visible, input:focus-visible, textarea:focus-visible` | Define contorno de foco afastado da caixa para navegação por teclado, sem depender de hover. |
| `address` | Mantém os dados de contato sem o itálico padrão e com espaço inferior. |
| `form` | Separa o formulário da explicação anterior. |
| `fieldset` | Agrupa campos com borda e padding móvel de `0.75rem`; `min-width: 0` permite encolher abaixo do mínimo intrínseco. |
| `legend` | Usa `max-width: 100%` para respeitar a largura do grupo e destaca seu título com cor, peso e padding lateral. |
| `label` | Destaca os nomes dos campos e aceita margem inferior com `inline-block`. A associação com o controle continua sendo feita por `for` e `id`. |
| `input, textarea` | Define controles em bloco, com largura de 100%, padding, borda e fonte herdada. `border-box` impede que padding e borda aumentem essa largura para além do contêiner. |
| `textarea` | Mantém altura mínima para a mensagem e permite redimensionar apenas verticalmente. |
| `button` | Harmoniza borda, padding e fonte e limita a largura a 100%; `white-space: normal` permite quebrar o texto do botão em telas estreitas. |
| `button:disabled` | Comunica a indisponibilidade por cores e cursor. O atributo HTML `disabled` é responsável por impedir a ativação. |
| `footer` | Separa o encerramento com borda superior, alinhamento central e texto menor. |
| `footer > p:last-child` | Remove a margem final redundante do último parágrafo do rodapé. |
| `#sobre, #contato` | Na query de tablet, estende biografia e contato da primeira até a última linha de colunas. |
| `#experiencias, #contato` | Na query de desktop, reserva duas colunas para os relatos e para o formulário. |

Na query `@media (min-width: 48rem)`, os seletores `header, main, footer` ampliam o padding para `1.5rem`; `h1` passa a `2.4rem` e `h2` a `1.6rem`. `nav ul` passa a três colunas; `main` passa a duas e seu gap aumenta para `1.5rem`. `main > section` amplia o padding para `1.5rem`, e `fieldset` passa a `1rem`. Os seletores de ID definem as extensões descritas acima.

Na query `@media (min-width: 75rem)`, `header, main, footer` passam a padding de `2rem`; `nav ul` passa a seis colunas e `main` a três. Os seletores de experiências e contato passam a duas colunas. Não é necessário repetir as regras de cor, fonte e borda, porque a cascata conserva as declarações anteriores.

`nav li`, existente na etapa 2, foi removido: os itens agora participam de Grid, que substitui `inline-block` e as margens dos itens como mecanismo de distribuição. Não adicionamos classes ou seletores que não tenham um alvo real no HTML.

## 7. Unidades, conteúdo e acessibilidade

`rem` acompanha a fonte raiz nas dimensões comuns; `em` acompanha a fonte do elemento no afastamento do sublinhado; `%` expressa a largura em relação ao bloco disponível; `fr` distribui o espaço da grade. Bordas de `1px` permanecem finas, sem transformar o conteúdo em caixas de largura fixa.

A fotografia mantém seus atributos HTML `width` e `height`, mas o CSS controla a apresentação com largura flexível limitada e altura automática. O texto alternativo continua disponível. Não fixamos alturas de seções nem escondemos conteúdo que não caiba. As quebras de texto, `minmax(0, 1fr)` e `min-width: 0` tratam causas de transbordamento em vez de ocultá-las com `overflow-x: hidden`.

Os links permanecem disponíveis em todas as larguras. Títulos, listas, rótulos e legendas preservam a leitura semântica. Não usamos `order`, posicionamento por áreas que reorganize as seções ou preenchimento denso da grade. A biografia precede formação, experiências, habilidades, perfis e contato na leitura do documento e na colocação visual.

O formulário continua uma demonstração: os campos recebem entrada, mas o botão desabilitado não envia nem confirma mensagens. O contato funcional oferecido é o link de e-mail, dependente de um aplicativo configurado.

## 8. Validação em três larguras

Abra as ferramentas de desenvolvimento do navegador, ative a simulação de dispositivos e use **375 px**, **768 px** e **1200 px** de largura. Com a fonte inicial padrão, confira a distribuição da tabela da seção 4. Teste também pouco antes e depois dos breakpoints, por exemplo 767/768 px e 1199/1200 px.

1. Confira nome, legenda e títulos sem cortes, fotografia sem ultrapassar o bloco e ausência de rolagem horizontal inesperada.
2. Clique nos seis links do menu e em “Voltar ao início”; todos devem apontar para a seção correta.
3. Percorra links e campos com Tab e verifique o foco visível e a ordem coerente.
4. Clique nos rótulos, digite nos campos e redimensione a mensagem verticalmente. O formulário deve respeitar a largura da seção em todas as três configurações.
5. Confira hover com o ponteiro no desktop e confirme que a navegação continua utilizável sem hover em uma interação por toque.
6. Aumente o zoom e verifique que o texto e o conteúdo continuam disponíveis; não há bloqueio de escala no viewport.
7. Salve uma captura de cada largura como evidência da entrega, se solicitada pelo professor.

Verificação realizada nesta implementação: inspeção estrutural do HTML, destinos de âncoras e rótulos, caminhos dos recursos locais, preservação do conteúdo e consistência das regras CSS. **A conferência visual nas três larguras e as capturas ainda precisam ser realizadas**: não havia navegador conectado disponível nesta sessão. As distribuições deste README descrevem o comportamento definido pelo CSS, sem apresentar capturas ou resultados visuais que não foram obtidos.

Antes de publicar, passe os arquivos por validadores de conformidade HTML e CSS e registre o endereço real do GitHub Pages. Se publicar o repositório inteiro, o caminho desta etapa deverá terminar em `/07-trabalho-1/03-mobile-first/`, dependendo da configuração escolhida.
