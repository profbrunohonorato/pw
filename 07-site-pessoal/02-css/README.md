# Programação para Web 1

## Etapa 2: Site pessoal com CSS

Prof. Bruno Honorato  
UTFPR - Campus Dois Vizinhos  
Outubro, 2026

## 1. Objetivo e requisitos

Esta etapa transforma visualmente a página de `01-html-puro`. O conteúdo e a estrutura continuam em HTML; a apresentação fica em uma folha CSS externa. O exemplo contempla cores, tipografia, espaçamentos, bordas, tamanhos, links, formulário, organização visual das seções e estado `hover`.

Não há JavaScript ou frameworks. Grid, Flexbox e media queries serão introduzidos na etapa 3. Este README documenta a segunda etapa, incluída na nota consolidada em `../nota-de-aula.pdf`.

## 2. Arquivos e execução

```text
02-css/
├── index.html
├── estilos.css
├── imagens/
│   └── bruno-honorato.jpg
└── README.md
```

Abra `index.html` no navegador. Não é necessário instalar dependências. A fotografia está copiada nesta etapa para que ela possa ser executada sem depender dos arquivos da etapa 1. Mantenha os caminhos relativos ao mover ou publicar o exemplo.

Aluno/autor do exemplo: Bruno de Castro Honorato Silva. Objetivo: separar estrutura e conteúdo da apresentação por meio de CSS externo. Link do site publicado: pendente; a publicação no GitHub Pages não faz parte desta alteração.

## 3. Evolução do HTML

A única nova tag é `link`, dentro de `head`:

```html
<link rel="stylesheet" href="estilos.css">
```

`rel="stylesheet"` identifica a relação do recurso com a página: trata-se de uma folha de estilos. `href="estilos.css"` informa seu caminho relativo ao HTML. `link` é um elemento vazio, sem tag de fechamento. O título da aba também passa a identificar a versão com CSS.

As demais tags e os atributos são preservados e estão explicados no [README da etapa 1](../01-html-puro/README.md). `header`, `nav`, `main`, `section`, `article` e `footer` continuam expressando seus papéis semânticos; não foram substituídos por elementos escolhidos apenas pela aparência. Os IDs continuam servindo às âncoras e aos rótulos do formulário. Não foi necessário adicionar classes para selecionar os elementos deste documento pequeno.

Para comparar as etapas, abra os dois arquivos HTML em abas distintas. Desabilitar a folha de estilos no navegador também revela a estrutura original. O formulário permanece demonstrativo, com envio indisponível: CSS não cria processamento ou envio de dados.

## 4. Lógica da apresentação

A página segue uma única coluna na ordem do HTML. O cabeçalho apresenta nome, fotografia e menu; as seções ficam empilhadas; o rodapé encerra o conteúdo. O fluxo normal do navegador faz essa organização, sem posicionamento absoluto, Flexbox ou Grid.

`max-width: 58rem` limita a largura dos blocos centrais para facilitar a leitura em telas amplas. `margin: 0 auto` centraliza esses blocos horizontalmente quando há espaço disponível. Não usamos altura fixa para o conteúdo: cada bloco cresce de acordo com seu texto.

O cabeçalho azul escuro e o detalhe dourado identificam visualmente a apresentação. Fundo cinza claro e seções brancas separam os assuntos; bordas e espaçamentos reforçam essa divisão. Os projetos têm um fundo próprio dentro da seção de experiências. Essas escolhas visuais complementam a hierarquia semântica existente.

O menu usa `inline-block`: cada item continua sendo uma caixa com padding e borda, mas participa de linhas de texto que podem quebrar quando falta espaço. Isso não é uma grade. As seções permanecem em uma coluna em todas as larguras, e nenhum breakpoint é definido nesta etapa.

`rem` toma como referência o tamanho da fonte do elemento raiz; `em` usa a fonte do elemento em que a propriedade é aplicada. Por exemplo, o afastamento do sublinhado em `0.2em` acompanha o tamanho do link. Percentuais como `width: 100%` se referem à largura disponível no bloco que contém o controle. Bordas de `1px` mantêm um contorno fino.

## 5. Por que usar cada seletor

Esta tabela cobre todos os seletores existentes em `estilos.css`, na ordem do arquivo. Uma vírgula agrupa seletores para compartilhar declarações; um espaço seleciona descendentes; `>` seleciona filhos diretos; `+` seleciona o irmão seguinte imediato. As pseudoclasses representam estados ou posições, sem alterar o HTML.

| Seletor | Alvo e motivo das declarações |
| --- | --- |
| `*` | Todos os elementos. `box-sizing: border-box` inclui padding e borda na largura declarada, evitando que campos com `width: 100%` ultrapassem o contêiner por causa desses acréscimos. |
| `body` | Define a base da página: remove a margem padrão, aplica fundo, cor, família tipográfica, tamanho e altura de linha. `overflow-wrap: anywhere` permite quebrar palavras ou endereços muito longos quando necessário. |
| `header, main, footer` | Compartilha largura máxima, centralização e padding entre os três blocos principais para manter o mesmo eixo visual. |
| `header` | Aplica o fundo azul, texto branco, alinhamento central e borda inferior dourada à apresentação. |
| `h1, h2, h3` | Reduz a altura de linha dos títulos para manter títulos de várias linhas coesos, independentemente da altura de linha do corpo. |
| `h1` | Dá destaque ao nome por tamanho e margem inferior, removendo a margem superior padrão. |
| `header > p` | Seleciona apenas o parágrafo de apresentação que é filho direto do cabeçalho. Limita sua largura, centraliza-o e usa uma cor clara. Não afeta parágrafos das seções. |
| `figure` | Remove a margem lateral padrão da figura e mantém uma distância inferior até o menu. |
| `figure img` | Seleciona a fotografia dentro da figura. `display: block` permite centralizá-la com margens automáticas. A largura de `12rem`, `max-width: 100%` e `height: auto` controlam tamanho e proporção. Borda dourada e `border-radius: 50%` tornam o retrato quadrado circular. |
| `figcaption` | Separa a legenda da foto, reduz seu tamanho e mantém contraste no fundo escuro. |
| `nav ul` | Remove marcadores e recuos apenas da lista do menu. As listas do conteúdo continuam mostrando marcadores. |
| `nav li` | Usa `inline-block` e pequenas margens para organizar itens do menu em linhas com intervalos entre as caixas. |
| `nav a` | Amplia a área clicável com padding, cria borda e cantos arredondados e aplica texto branco. Remove o sublinhado porque o contorno já identifica os links como controles de navegação. |
| `nav a:hover` | Ao passar o ponteiro sobre um link do menu, inverte fundo e cor do texto para indicar a interação. |
| `main > section` | Seleciona as seções diretamente contidas em `main`. Aplica fundo branco, borda, cantos arredondados, padding interno e distância inferior entre os blocos. |
| `h2` | Marca o início das seções com fonte maior, cor azul, margem inferior e uma borda lateral dourada acompanhada de padding. |
| `h3` | Identifica os títulos de projetos com tamanho menor que `h2`, preservando a hierarquia visual. |
| `p` | Normaliza o espaçamento dos parágrafos: sem margem superior e com margem inferior. |
| `main ul` | Define recuo para os marcadores das listas do conteúdo e remove margens padrão que variam entre elementos. |
| `main li + li` | Acrescenta espaço antes de cada item que venha imediatamente após outro `li`. O primeiro item não recebe esse espaço. |
| `article` | Delimita cada experiência com padding, fundo claro e borda lateral. A unidade semântica já existe no HTML. |
| `article + article` | Separa experiências consecutivas sem acrescentar espaço antes do primeiro projeto. |
| `article > p` | Remove a margem inferior do parágrafo direto de cada projeto; o padding do artigo já fornece espaço até sua borda. |
| `a` | Define a cor dos links e afasta o sublinhado do texto para melhorar a leitura. O menu sobrescreve a cor com seu seletor mais específico. |
| `a:hover` | Aumenta a espessura do sublinhado dos links que o exibem ao passar o ponteiro. No menu, o feedback principal é a inversão de cores de `nav a:hover`. |
| `a:focus-visible, input:focus-visible, textarea:focus-visible` | Mostra um contorno afastado da caixa quando o navegador identifica a necessidade de foco visível, como na navegação por teclado. Não removemos o foco nativo sem oferecer um indicador substituto. |
| `address` | Remove o itálico padrão e separa os dados de contato do texto seguinte. O significado de contato do autor permanece o mesmo. |
| `form` | Separa o formulário do texto que explica sua natureza demonstrativa. |
| `fieldset` | Estiliza o agrupamento dos campos com borda, padding e cantos arredondados. `min-width: 0` permite que ele encolha sem impor a largura mínima intrínseca padrão do agrupamento. |
| `legend` | Cria espaço nas laterais do título do grupo e destaca sua identificação com cor e peso de fonte. |
| `label` | Torna o rótulo uma caixa `inline-block` para aceitar margem inferior e destaca o nome do campo em negrito. A associação `for`/`id` continua sendo feita pelo HTML. |
| `input, textarea` | Padroniza largura, padding, borda, fundo, texto e cantos dos controles. `font: inherit` faz os campos usarem a fonte do documento; `display: block` organiza cada campo em sua própria linha. |
| `textarea` | Define uma altura mínima para a mensagem e permite redimensionamento vertical, evitando que o visitante arraste o campo lateralmente para fora do formulário. |
| `button` | Harmoniza padding, borda, arredondamento e fonte com os demais controles. |
| `button:disabled` | Explicita o estado indisponível por cores e cursor. Quem impede a ativação é o atributo HTML `disabled`, não a regra CSS. |
| `footer` | Separa o encerramento com borda superior, texto centralizado e fonte menor. O rodapé continua no fluxo normal. |
| `footer > p:last-child` | Remove a margem inferior apenas do último parágrafo direto do rodapé; o padding do rodapé já garante o espaço final. |

## 6. Cascata, especificidade e herança

O navegador combina as regras aplicáveis. `body` estabelece propriedades tipográficas que os descendentes normalmente herdam; `font: inherit` faz os controles de formulário participarem dessa escolha. Margens, bordas e padding precisam ser declarados nos elementos correspondentes porque não são herdados da mesma maneira.

`a` seleciona links em geral, enquanto `nav a` seleciona links dentro da navegação e tem maior especificidade. Por isso, os links do menu permanecem brancos mesmo com a regra geral de cor aparecendo depois no arquivo. Entre regras de mesma origem, importância e especificidade, a que aparece por último resolve conflitos sobre a mesma propriedade. Não há `!important` neste exemplo.

Seletores como `article > p` especializam o espaçamento definido em `p`; `header > p` especializa o parágrafo introdutório. `main li + li` deixa o primeiro item sem espaçamento adicional por selecionar apenas itens com um irmão anterior imediato. Assim, cada regra tem um alvo ligado à estrutura real da página.

## 7. Layout e limite desta etapa

O CSS usa o modelo de caixa: conteúdo, padding, borda e margem. `padding` afasta o texto da borda do próprio elemento; `margin` separa esse elemento dos vizinhos. `border-box` facilita o cálculo dos controles, pois a largura de 100% já inclui seu padding e suas bordas.

A imagem preserva a proporção com `height: auto`; a largura CSS substitui a largura de apresentação do atributo HTML quando a folha é aplicada. Os atributos originais continuam disponíveis na versão sem CSS. Os campos aproveitam a largura do formulário sem exigir tamanhos fixos em pixels.

Essas medidas evitam rigidez desnecessária, mas ainda não implementam o layout responsivo solicitado na etapa 3. Na próxima etapa, será preciso justificar a estratégia Mobile First, os breakpoints, o contêiner Grid ou Flexbox, a distribuição dos itens e a adaptação entre larguras.

## 8. Conferência e entrega

1. Abra `index.html` e confirme que o fundo, o cabeçalho, a fotografia circular e os blocos de conteúdo recebem os estilos.
2. Confira no navegador se `estilos.css` e a fotografia carregaram sem erro de caminho.
3. Clique nos seis destinos do menu e em “Voltar ao início”. A estilização não altera os IDs ou os destinos das âncoras.
4. Passe o ponteiro pelos links do menu e pelos links do conteúdo; observe os respectivos estados `hover`.
5. Use Tab para percorrer links e campos; verifique o contorno de foco. Clique nos rótulos e confira o foco no controle correspondente.
6. Digite nos campos, redimensione a mensagem verticalmente e confirme que o botão de envio permanece desabilitado.
7. Compare com a etapa 1: conteúdo e ordem de leitura devem coincidir; a transformação está na apresentação.
8. Antes de publicar, valide o HTML e o CSS em validadores de conformidade e registre a URL real do GitHub Pages neste README.
