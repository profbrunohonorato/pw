# 4 — Tendências do HTML e Web 3.0

Abra `index.html` pelo [servidor local](../README.md). A página reúne exemplos reais de recursos nativos, um componente reutilizável, metadados estruturados e um modo offline opcional. Não há blockchain, carteira ou serviço externo conectado automaticamente.

## O que “Web 3.0” significa nesta aula

O termo não tem um único significado. Na visão de **web semântica**, dados recebem descrições e relações que permitem interoperabilidade e processamento por máquinas. Na visão de **Web3 descentralizada**, surgem aplicações com carteiras, contratos e redes distribuídas. São ideias diferentes que podem coexistir.

HTML continua sendo um padrão em evolução, o [HTML Living Standard](https://html.spec.whatwg.org/). Não existe uma versão “HTML 3.0 da Web3” que substitua a linguagem atual. Recursos modernos de interface, PWA e acessibilidade não dependem de blockchain. A inclusão abaixo é uma seleção didática de caminhos de evolução, não uma previsão de adoção universal. Contexto de Web3: [Ethereum.org](https://ethereum.org/web3/).

| Caminho | Papel do HTML/front-end | Limite importante |
| --- | --- | --- |
| Web semântica e dados conectados | Estrutura legível, links e metadados como JSON-LD | Dados precisam representar o conteúdo real; não garantem resultados especiais no Google |
| Recursos nativos de interação | `dialog`, popover, `details`, formulários | Compatibilidade depende de navegador e versão |
| Web Components | Custom Elements, template e Shadow DOM | Encapsular estilo não cria uma barreira de segurança |
| PWA e offline | Manifest, service worker e Cache Storage | Instalação e suporte variam; offline não significa descentralização |
| IPFS e conteúdo endereçado por hash | Publicação de arquivos estáticos e links relativos | Disponibilidade depende de nós/pinning; um gateway ainda pode ser centralizado |
| Carteiras e identidade verificável | Interface solicita permissões e apresenta desafios | Conta exposta não autentica usuário automaticamente; chaves privadas ficam fora da página |

## Exemplos implementados

### Dialog, popover e details

O botão de modal usa `dialog.showModal()` e um formulário `method="dialog"` para fechar. Popover usa `popovertarget` e é não modal; `details` funciona sem JavaScript. O exemplo detecta suporte e informa quando dialog ou popover não estão disponíveis.

Experimente teclado, foco, Escape e a interação com o restante da página. Modalidade não dispensa um título acessível e controles claros. Fontes: [dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog) e [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API).

### Web Component

`<aula-counter>` é registrado com `customElements.define`. Seu template é clonado no Shadow DOM; o botão atualiza um contador anunciado por `aria-live`. Não há dependência de framework. Adicione uma segunda instância no HTML e verifique que cada contador tem estado próprio.

Shadow DOM organiza DOM e estilo, mas não protege segredos contra scripts que executam na mesma página. Fonte: [MDN — Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components).

### JSON-LD

O `<head>` contém um objeto JSON-LD com vocabulário Schema.org e tipo `LearningResource`. Ele descreve o laboratório sem alterar a aparência. O navegador não trata esse bloco como JavaScript executável. Inspecione o código-fonte, altere o nome do material e mantenha os metadados coerentes com o conteúdo visível.

Dados conectados podem expressar relações entre entidades e documentos, sem blockchain. Nem todo tipo de Schema.org tem um resultado enriquecido correspondente na busca. Fontes: [W3C — JSON-LD 1.1](https://www.w3.org/TR/json-ld11/), [Schema.org — LearningResource](https://schema.org/LearningResource) e [Google — dados estruturados](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data).

### Service worker e offline

O registro só ocorre ao clicar em **Ativar exemplo offline**. `sw.js` pertence a esta pasta e seu escopo é `./`; não controla as outras aulas. O cache `pw08-tendencias-v1` inclui somente a página, script, estilo compartilhado, manifest e ícone. O worker só intercepta GET da lista explícita de recursos da mesma origem. A estratégia tenta a rede primeiro e usa a cópia local se a rede falhar.

Não há `skipWaiting` ou `clients.claim`: o ciclo de atualização continua sob as regras normais do navegador. A primeira instalação exige acesso aos arquivos; a primeira página aberta pode ainda não estar controlada. Fonte: [MDN — uso de service workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers).

## Tutorial: testar e atualizar a PWA

1. Abra por `http://localhost:8000/08-topicos/4-tendencias-web-3/` ou HTTPS. Um IP de rede local servido por HTTP normalmente não é contexto seguro, mesmo que localhost seja.
2. Clique em Ativar. Aguarde a instalação no painel Application → Service Workers.
3. Recarregue. Confira que a página tem um controlador ativo e que Cache Storage contém os arquivos previstos.
4. Marque Offline em Network e recarregue a mesma URL. Página e interações locais devem continuar disponíveis. Os links para documentação e outras aulas não entram no cache desta demonstração.
5. Volte ao modo online. A instalação pelo navegador é opcional e depende de suporte, políticas e critérios do produto. Manifest e worker não garantem que um botão de instalar apareça em todos os navegadores.
6. Para publicar uma atualização, altere os arquivos e revise a versão do cache. Planeje a limpeza das versões antigas de **seus próprios caches**, a ativação e o aviso de atualização, sem remover caches de outras aplicações da origem.
7. Use Remover exemplo offline. O botão cancela apenas o registro com o escopo desta pasta e apaga apenas o cache desta aula. Feche as abas controladas para encerrar um worker ainda em uso; depois, ao abrir online, ele não será registrado novamente sem clique.

Em uma produção com dados privados, cacheie apenas o que foi planejado para uso local e defina como limpar os dados ao sair. Não trate cache como backup. A simulação de cookie do laboratório 3 é independente deste worker.

## Tutorial: publicar uma página HTML no IPFS

Este roteiro exige instalar uma ferramenta IPFS ou usar um provedor escolhido pelo aluno; nada é enviado pela aplicação da aula.

1. Crie uma pasta de publicação com `index.html`, CSS, scripts e imagens. Para publicar este conjunto, inclua `assets/` e as quatro pastas a partir de `08-topicos`, pois os laboratórios usam o estilo compartilhado.
2. Verifique links relativos. Caminhos absolutos de domínio podem falhar quando a publicação é acessada como `/ipfs/CID/`. Se publicar apenas a pasta 4, copie o CSS para dentro dela e ajuste os links.
3. Adicione a pasta ao IPFS Desktop ou à ferramenta indicada pela documentação e obtenha seu CID. O CID endereça o conteúdo; alteração no conjunto publicado produz outro CID.
4. Mantenha o conteúdo disponível por pinning em nós/provedor. Ter um CID não significa que alguém continuará hospedando os arquivos indefinidamente.
5. Abra por um gateway e confira todos os recursos. A página continua sendo HTML entregue ao navegador; a rede de distribuição mudou.
6. Se quiser um nome estável, estude IPNS ou DNSLink e o uso de domínio próprio. Isso exige configurar publicação e/ou DNS; não é implementado nesta aula.
7. Não habilite service workers em um gateway de caminho compartilhado sem entender suas regras de origem e escopo. A configuração offline foi pensada para localhost/HTTPS sob seu controle, não para qualquer gateway.

Fonte: [IPFS — hospedar um site](https://docs.ipfs.tech/how-to/websites-on-ipfs/single-page-website/).

## Tutorial: interface HTML com carteira Web3

O laboratório não acessa extensões. Para um estudo separado, use uma carteira e rede de testes sob seu controle:

1. Escolha uma biblioteca ou provedor documentado e implemente um botão de conexão explícito. Descubra o provedor pelo mecanismo recomendado, considerando carteiras múltiplas; não presuma que todo navegador oferece `window.ethereum`.
2. Para um provedor compatível com EIP-1193 já selecionado, uma solicitação pode usar `provider.request({ method: 'eth_requestAccounts' })`. Isso pede acesso às contas; não transfere valores nem autentica, por si só, uma sessão do seu servidor.
3. Trate recusa de permissão, ausência do provedor, desconexão, `accountsChanged` e `chainChanged`. Mostre a rede e a conta de forma compreensível.
4. Para login, crie no servidor um desafio com nonce de uso único, domínio e prazo. Apresente a mensagem e verifique a assinatura e o contexto no servidor antes de criar a sessão. Use um protocolo estabelecido em vez de inventar autenticação por endereço.
5. Separe conexão, autenticação, assinatura de mensagem e transação. Apresente o conteúdo de cada autorização antes de solicitar confirmação. Nunca solicite frase de recuperação ou chave privada em um formulário.
6. Use ativos de teste e mantenha a experiência separada dos exemplos básicos desta pasta. Smart contracts, RPC, armazenamento e custos da rede são responsabilidades adicionais à interface HTML.

Fontes: [EIP-1193 — API de provedor](https://eips.ethereum.org/EIPS/eip-1193), [EIP-6963 — descoberta de provedores](https://eips.ethereum.org/EIPS/eip-6963) e [ERC-4361 — Sign-In with Ethereum](https://eips.ethereum.org/EIPS/eip-4361).

## Exercícios

- Explique por que usar Web Components não transforma uma página em aplicação descentralizada.
- Compare JSON-LD, IndexedDB e IPFS: qual problema cada um resolve?
- Desative JavaScript e identifique quais partes do conteúdo e da interação continuam disponíveis.
- Desenhe uma aplicação offline e outra descentralizada, distinguindo interface, dados, identidade e distribuição.
