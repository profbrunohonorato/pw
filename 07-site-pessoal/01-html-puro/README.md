# Programação para Web 1

## Nota de aula: Site pessoal com HTML puro

Prof. Bruno Honorato  
UTFPR - Campus Dois Vizinhos  
Outubro, 2026

Este README documenta a primeira etapa. A nota de aula consolidada está em `../nota-de-aula.pdf`, com as três etapas e os códigos para consulta. Sua versão textual está em `../nota-de-aula.md`, e o gerador está em `../gerar_pdf.py`.

## Sumário

1. Objetivo e requisitos da primeira etapa
2. Estrutura básica do documento
3. Cabeçalho, imagem e navegação
4. Conteúdo principal e hierarquia semântica
5. Links e contato
6. Formulário de demonstração
7. Identificadores, seletores e lógica do layout
8. Execução, validação e entrega
9. Apêndice: código completo

## 1. Objetivo e requisitos da primeira etapa

O objetivo é construir a primeira versão do site pessoal de Bruno de Castro Honorato Silva usando somente HTML. Esta etapa não permite CSS, frameworks CSS ou JavaScript. A aparência simples é intencional: avaliamos o significado dos elementos, a organização do conteúdo e a navegação.

O exemplo atende aos itens mínimos: nome e apresentação, fotografia, Sobre mim, formação acadêmica, experiências e projetos, habilidades e tecnologias, perfis profissionais, contato e navegação entre as partes. Há também um formulário demonstrativo. O enunciado aceita GitHub, LinkedIn ou outros perfis relevantes; o exemplo inclui LinkedIn, Lattes e ORCID.

Abra `index.html` diretamente no navegador. A foto está em `imagens/bruno-honorato.jpg`; portanto, mantenha essa pasta junto do HTML. Não há dependências para executar o site.

## 2. Estrutura básica do documento

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Site pessoal de Bruno de Castro Honorato Silva, professor da UTFPR: formação, pesquisa, tecnologias e contato.">
  <title>Bruno Honorato | Site pessoal</title>
</head>
<body>
  <!-- O conteúdo visível fica aqui. -->
</body>
</html>
```

`<!DOCTYPE html>` é uma declaração, não uma tag de conteúdo. Ela informa que o documento usa HTML moderno e aciona o modo de padrões do navegador.

`html` é o elemento raiz. `lang="pt-BR"` identifica o idioma, ajudando leitores de tela a pronunciar o texto corretamente. `head` reúne metadados; `body` contém o conteúdo apresentado ao visitante. Separá-los evita colocar informações de configuração no fluxo da página.

As três ocorrências de `meta` possuem finalidades distintas. `charset="UTF-8"` preserva os caracteres acentuados. `name="viewport"` e seu `content` ajustam a área de visualização à largura do dispositivo e definem a escala inicial; essa configuração prepara as etapas seguintes, mas não cria responsividade por si só. `name="description"` e seu `content` descrevem a página para ferramentas que leem metadados, podendo ser usados em resultados de busca.

`title` define o título da aba e dos favoritos. Ele não substitui o título visível `h1`. Não usamos `style`, `link` para folhas de estilo, atributos `style` nem `script`, porque CSS e JavaScript estão fora do escopo.

## 3. Cabeçalho, imagem e navegação

`header` reúne a apresentação e a navegação introdutória da página. Seu `id="inicio"` permite voltar ao topo pelo link do rodapé. O `h1` contém o nome completo: é o título principal desta página. `p` marca a breve apresentação como parágrafo, em vez de simular títulos ou espaçamento com quebras de linha.

`figure` agrupa a fotografia e sua legenda como uma unidade de conteúdo. `img` incorpora a imagem; `src` aponta para um arquivo local relativo ao HTML. `alt` oferece uma descrição textual do retrato para quem não consegue vê-lo. `width="240"` e `height="240"` fornecem dimensões de apresentação em pixels e preservam a proporção quadrada do arquivo original. São atributos HTML da imagem, não CSS. Eles não constituem uma solução geral de imagem responsiva. `figcaption` identifica o professor na legenda visível, complementando o texto alternativo.

```html
<nav aria-label="Navegação principal">
  <ul>
    <li><a href="#sobre">Sobre mim</a></li>
    <li><a href="#formacao">Formação acadêmica</a></li>
  </ul>
</nav>
```

`nav` identifica um conjunto importante de links de navegação. `aria-label` dá um nome acessível a essa região. `ul` representa um conjunto de destinos sem ordem obrigatória; `li` identifica cada item. `a` cria o hyperlink; `href="#sobre"` aponta para o elemento com `id="sobre"`. O mesmo raciocínio se aplica a formação, experiências, habilidades, perfis e contato. O deslocamento é nativo do navegador: não exige JavaScript.

## 4. Conteúdo principal e hierarquia semântica

`main` contém o assunto central da página. Há uma única ocorrência, separada do cabeçalho e do rodapé. `section` divide esse assunto em seis blocos temáticos: Sobre mim, Formação acadêmica, Experiências e projetos, Habilidades e tecnologias, Perfis profissionais e Contato. Cada seção tem um `h2` e um identificador exclusivo.

Os títulos seguem uma hierarquia: `h1` identifica o site pessoal, `h2` apresenta as seções e `h3` nomeia cada experiência dentro da seção de projetos. Escolhemos o nível pelo papel no documento, não pelo tamanho visual padrão. Isso facilita a leitura e a navegação por títulos em tecnologias assistivas.

`article` aparece em cada experiência porque cada bloco possui um título e uma descrição que fazem sentido como uma unidade independente. `section` agrupa o tema; `article` individualiza um relato dentro dele. Não usamos `article` para todo parágrafo nem criamos `div` sem necessidade.

`p` separa as ideias da apresentação, da biografia e dos projetos. `ul` e `li` também organizam formações, habilidades e perfis: são coleções, não sequências de instruções. `strong` destaca semanticamente os nomes dos graus acadêmicos. Sua escolha indica importância, embora o navegador normalmente também mostre o texto em negrito.

O conteúdo apresenta as instituições, os períodos de formação e as áreas de atuação. A seção de tecnologias não atribui níveis de proficiência ou certificações adicionais.

## 5. Links e contato

Nos perfis, `a` usa endereços HTTPS completos em `href`, porque o destino é externo ao site. O texto descreve o destino, como “LinkedIn de Bruno Honorato”, em vez de “clique aqui”. Os links abrem na mesma aba pelo comportamento padrão; não há atributo `target`.

`address` marca a informação de contato profissional do autor da página. Ele não é um recurso para colocar qualquer endereço postal em itálico. `br` separa a instituição da linha de e-mail, uma quebra pertinente ao bloco de contato. Não o usamos para fabricar margens ou alinhar colunas.

O link com `href="mailto:brunosilva@utfpr.edu.br"` solicita ao navegador a abertura de um aplicativo de e-mail configurado. O envio depende desse aplicativo; o site não envia mensagens sozinho.

`footer` encerra a página com autoria, contexto didático e o link `href="#inicio"`. Sua posição após `main` expressa o encerramento do documento; o elemento não fixa o rodapé na parte inferior da janela.

## 6. Formulário de demonstração

```html
<form>
  <fieldset>
    <legend>Mensagem de contato (demonstração)</legend>
    <p><label for="nome">Nome:</label><br><input type="text" id="nome" name="nome" autocomplete="name" required></p>
    <p><label for="email">E-mail:</label><br><input type="email" id="email" name="email" autocomplete="email" required></p>
    <p><label for="mensagem">Mensagem:</label><br><textarea id="mensagem" name="mensagem" rows="5" cols="30" required></textarea></p>
    <button type="button" disabled>Envio indisponível nesta etapa</button>
  </fieldset>
</form>
```

`form` identifica a região de coleta de dados. Não configuramos `action` nem serviço de processamento nesta etapa: o formulário é demonstrativo, como permite o enunciado. A omissão de `action` não deve ser interpretada como garantia de ausência de submissão; se houver submissão nativa, o destino padrão é o documento atual. O exemplo evita oferecer um botão de envio e orienta o visitante a usar o e-mail.

`fieldset` agrupa os controles relacionados e `legend` fornece o título acessível desse grupo. `label` dá um nome a cada campo. Seu `for` deve coincidir exatamente com o `id` do controle: `nome`, `email` e `mensagem`. Clicar no rótulo transfere o foco ao campo correspondente.

`input` é usado para valores de uma linha. `type="text"` aceita o nome; `type="email"` expressa o formato esperado e permite verificações nativas de formato quando a validação é acionada. Essas verificações não comprovam que o endereço existe. `textarea` aceita a mensagem em várias linhas. `rows="5"` e `cols="30"` sugerem dimensões iniciais em linhas e colunas de caracteres, não limites de tamanho da mensagem.

`id` identifica cada controle dentro do documento; `name` define a chave que seria usada na submissão dos dados. São finalidades diferentes mesmo quando os valores são iguais. `autocomplete="name"` e `autocomplete="email"` informam o tipo de dado para o preenchimento automático do navegador. `required` marca campos obrigatórios para uma futura submissão validada; o botão deste exemplo não aciona essa validação.

`button` exibe explicitamente a indisponibilidade do envio. `type="button"` evita a função padrão de submissão e `disabled` impede sua ativação. Não há promessa de envio, armazenamento ou confirmação. Os `p` agrupam cada rótulo com seu controle, e `br` separa o rótulo da área de entrada na apresentação nativa.

## 7. Identificadores, seletores e lógica do layout

Nesta etapa não há seletores CSS nem layout em grade. Isso é uma decisão exigida pelo enunciado da primeira entrega, não uma lacuna do exemplo. O navegador apresenta os elementos com seus estilos padrão e o documento segue a ordem de leitura do HTML: apresentação, navegação, seções e rodapé. As listas e os blocos ficam no fluxo normal, sem posicionamento manual.

`id="sobre"` é um atributo HTML. `href="#sobre"` é uma referência a um fragmento do documento. Já `#sobre`, dentro de uma futura regra CSS, seria um seletor de ID. A grafia parecida não transforma a âncora em CSS. Os IDs das seções são destinos de navegação; os IDs dos controles são alvos dos rótulos. Todos devem ser únicos.

Também não há atributos `class` no exemplo. Não acrescentamos classes apenas para antecipar um CSS que não existe. Na etapa 2, cada seletor introduzido deverá ser explicado pelo conjunto de elementos que seleciona e pelo efeito da regra correspondente.

O layout em grade pertence à etapa 3. Uma futura aplicação de Grid deverá justificar qual elemento vira contêiner, quais filhos são itens, como as colunas são definidas, por que determinado espaçamento é usado e quando a quantidade de colunas muda. A ordem visual deverá preservar uma leitura coerente com a ordem do HTML. Essas regras não estão implementadas no Trabalho 1.

Não usamos tabelas, espaços repetidos nem atributos antigos de apresentação para simular uma grade. Tabelas representam dados tabulares; a organização de colunas de uma interface será tratada com CSS nas próximas etapas.

## 8. Execução, validação e entrega

1. Abra `index.html` no navegador e confirme nome, apresentação, foto e todas as seções.
2. Clique nos seis links do menu e em “Voltar ao início”. Cada fragmento deve corresponder a um ID existente e exclusivo.
3. Acesse os links de Lattes, LinkedIn e ORCID. A disponibilidade e as exigências de login pertencem aos serviços externos.
4. Clique nos rótulos do formulário e navegue pelos controles com a tecla Tab. Verifique que o botão informa a indisponibilidade e está desabilitado.
5. Confira que a página não inclui CSS, JavaScript ou frameworks e que o arquivo de imagem foi incluído na entrega.
6. Valide o HTML em um validador de conformidade, como o Nu HTML Checker, antes da publicação. A inspeção local da estrutura não substitui essa validação completa.
7. Faça commit do código, da imagem e do README no repositório da atividade. Configure o GitHub Pages e registre neste README a URL real depois de publicá-lo.

Aluno/autor do exemplo: Bruno de Castro Honorato Silva. Objetivo: demonstrar a primeira entrega do site pessoal com estrutura semântica e conteúdo em HTML puro. Publicação: pendente; a URL de GitHub Pages ainda não foi registrada. A publicação não foi realizada nesta tarefa.

Como este exemplo está em uma subpasta, uma publicação do repositório inteiro normalmente usará o caminho `/07-trabalho-1/01-html-puro/` após a URL base do GitHub Pages. Confirme a configuração real do repositório antes de registrar o endereço.

Para regenerar a nota consolidada, consulte as instruções no README da pasta `07-trabalho-1`.

## 9. Apêndice: código completo

O código integral da implementação está em `index.html`, na mesma pasta. O PDF o incorpora automaticamente nesta seção para permitir a leitura da nota sem depender de outro arquivo. No README, consulte diretamente o arquivo para evitar manter duas cópias que possam divergir. Todas as tags e todos os atributos presentes nessa implementação foram explicados nas seções anteriores.
