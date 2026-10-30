# 1 — HTML semântico, domínios, DNS, slug e SEO

Abra `index.html` pelo servidor descrito no [guia geral](../README.md). A aplicação tem conteúdo semântico, um gerador de slug e uma tabela de registros DNS fictícios. Registro, alterações de DNS e Google Search Console exigem contas e um site publicado; os passos abaixo são tutoriais.

## HTML semântico na prática

`header` apresenta a página; `nav` agrupa a navegação; `main` identifica o conteúdo principal; `section` reúne um assunto com título; `article` representa conteúdo independente; `aside` traz conteúdo complementar; `footer` encerra a página. `time` fornece uma data legível por máquina; `label` nomeia um controle; `button` executa uma ação e `a` leva a outro recurso.

Leia o código e localize esses elementos. Percorra a página com Tab e use o link “Pular para o conteúdo”. Inspecione a hierarquia de títulos e os landmarks na árvore de acessibilidade. O gerador usa `textContent`, normaliza acentos, converte para minúsculas, substitui separadores por hífen e remove hífens das extremidades.

Slug é um trecho legível de URL: `cafe-e-tecnologia-em-dois-vizinhos`. Não é domínio nem registro DNS. Em produção, trate títulos que geram slugs iguais, caracteres de outros alfabetos, palavras reservadas e mudanças de endereço. O gerador desta aula usa apenas letras latinas ASCII e números; uma aplicação pode escolher outra política. Ao mudar um slug publicado, configure redirecionamento permanente do endereço antigo e atualize links e sitemap.

## Domínio, DNS e hospedagem são serviços diferentes

O domínio identifica um nome registrado por determinado período, sujeito a renovação. O registrador administra o registro; os servidores DNS autoritativos publicam os registros; a hospedagem entrega arquivos ou executa a aplicação. Um mesmo fornecedor pode prestar vários desses serviços.

| Exemplo | O que significa | O que conferir |
| --- | --- | --- |
| `example.com` | `.com` é um domínio de topo genérico, de uso internacional | Disponibilidade, regras do registrador, renovação e titularidade |
| `nome.com.br` | `.br` é o domínio de topo do Brasil; `com.br` é uma categoria abaixo dele | Regras e categorias do Registro.br; documentos e titular elegível |
| `example.org` | `.org` é outro domínio de topo genérico, associado historicamente a organizações | Registro não comprova que a entidade seja sem fins lucrativos |
| `nome.dev` | `.dev` é um domínio de topo genérico usado em projetos de desenvolvimento | Exige atenção ao HTTPS e às regras do registro |
| `blog.example.com` | Subdomínio administrado pelo titular de `example.com` | Configuração de DNS e hospedagem; em geral não é novo registro de domínio |

A extensão não informa a linguagem usada no site, não concede confiança automática e não garante posição no Google. Nem toda categoria `.br` tem os mesmos critérios. Consulte [as categorias do Registro.br](https://registro.br/dominio/categorias/) e [o processo de registro explicado pela ICANN](https://www.icann.org/resources/pages/domain-name-registration-process-2023-11-02-en). O domínio `.dev` usa HTTPS obrigatório em navegadores com a lista HSTS correspondente; veja o [Google Registry](https://www.registry.google/domains/dev/). Compare preços atuais de registro e renovação diretamente no fornecedor; não há valores fixados nesta aula.

## Tutorial: registrar um domínio e configurar DNS

1. Escolha um nome e consulte a disponibilidade no Registro.br para `.br` ou em um registrador para o domínio de topo escolhido. Confirme regras, titular, renovação, transferência e recuperação da conta.
2. Registre o domínio com os dados corretos, habilite autenticação multifator e acompanhe os avisos de vencimento. Registrar não significa comprar o nome para sempre.
3. Contrate ou escolha a hospedagem. Obtenha os destinos DNS indicados por ela; não use os IPs fictícios da página.
4. Decida quem hospedará a zona DNS. Se mudar os servidores de nomes (`NS`) no registrador, recrie antes os registros necessários, inclusive e-mail. Mudar só um registro A não exige trocar a delegação inteira.
5. Configure A para IPv4, AAAA para IPv6 ou CNAME para um hostname de destino, conforme o provedor. CNAME não recebe URL com `https://` ou caminho. No domínio raiz, siga o suporte do provedor a A/AAAA, ALIAS/ANAME ou flattening; um CNAME comum não pode coexistir com outros dados no mesmo nome.
6. Preserve MX e os TXT de serviços usados, como SPF e verificações. TTL controla cache; alterações não aparecem instantaneamente em todos os resolvedores.
7. Ative o domínio personalizado na hospedagem, emita o certificado HTTPS e configure redirecionamento entre o domínio principal e sua variante `www`, quando necessário. DNS não faz redirecionamento de URL.
8. Verifique DNS e HTTP. Se houver e-mail, teste-o também após a mudança.

```sh
# Consultas de exemplo: substitua pelo domínio sob seu controle.
dig example.com A
dig example.com AAAA
dig www.example.com CNAME
dig example.com MX
dig example.com TXT
curl -I https://example.com
```

DNSSEC autentica respostas DNS; HTTPS protege a conexão HTTP. Um não substitui o outro. Fonte dos tipos de registros: [documentação DNS da Cloudflare](https://developers.cloudflare.com/dns/manage-dns-records/reference/dns-record-types/).

## Tutorial: preparar o site para SEO e Google Search

SEO ajuda pessoas e mecanismos de busca a entenderem o conteúdo. Crie textos úteis, estrutura legível, links internos descritivos e páginas rápidas. Comprima imagens, informe dimensões e texto alternativo adequado, evite arquivos desnecessários e teste em telas pequenas. Semântica ajuda a organização e a acessibilidade; usar uma tag específica não garante ranking.

1. Publique cada conteúdo em uma URL estável e acessível por link HTML. Retorne status HTTP apropriados; uma página inexistente deve retornar 404.
2. Defina `lang`, `title` e meta description específicos. O Google pode escolher outro trecho para o resultado. Não use `meta keywords` como estratégia.
3. Adicione canonical absoluto coerente com a URL publicada; ele é um sinal de preferência, não uma ordem. Não deixe `example.com` em um site real.
4. Gere sitemap XML com URLs canônicas reais. Coloque `robots.txt` na raiz da origem; um arquivo dentro desta pasta não controla o site inteiro.
5. Confira que não existe `noindex` acidental. `robots.txt` controla rastreamento e não protege dados privados nem garante desindexação. Uma página bloqueada pode continuar conhecida pelo buscador.
6. Teste desempenho e acessibilidade com Lighthouse/PageSpeed Insights. Use dados estruturados apenas quando descrevem conteúdo realmente disponível na página e atendem ao tipo suportado.

Trecho de configuração ilustrativo para o `<head>` de um artigo publicado:

```html
<title>Café e tecnologia em Dois Vizinhos | Minha publicação</title>
<meta name="description" content="Encontros e ideias sobre tecnologia em Dois Vizinhos.">
<link rel="canonical" href="https://example.com/artigos/cafe-e-tecnologia/">
```

Exemplo de `robots.txt` **na raiz do domínio**:

```text
User-agent: *
Allow: /
Sitemap: https://example.com/sitemap.xml
```

Exemplo de `sitemap.xml`, também adaptado ao site real:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://example.com/artigos/cafe-e-tecnologia/</loc></url>
</urlset>
```

A página didática não inclui canonical ou sitemap de produção com endereços fictícios. Consulte o [guia de SEO do Google](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) e as orientações de [canonical](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/intro) e [sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview).

## Tutorial: Google Search Console

1. Publique o site acessível pela internet. `localhost` não pode ser indexado pelo Google.
2. Adicione uma propriedade no Search Console. A propriedade de domínio abrange protocolos e subdomínios e exige verificação por DNS; prefixo de URL permite métodos compatíveis com o acesso que você tem à hospedagem.
3. Copie exatamente o TXT solicitado e cadastre no DNS do domínio. Para prefixo, use o arquivo ou a meta tag fornecidos quando esse método estiver disponível. Não invente o token.
4. Verifique a propriedade e mantenha o comprovante. Em hospedagem compartilhada como GitHub Pages, talvez você não controle o DNS de `github.io`; use um método de prefixo de URL compatível.
5. Envie o sitemap real e use a inspeção de URL para examinar descoberta, rastreamento e indexação. Corrija impedimentos antes de solicitar nova avaliação.
6. Acompanhe relatórios de indexação e desempenho. Solicitar indexação não garante inclusão nem posição.

Fonte: [verificação de propriedade no Search Console](https://support.google.com/webmasters/answer/9008080).

## Exercícios

- Gere slugs de dois títulos que diferem apenas por acentos e proponha como evitar colisões.
- Explique por que criar um CNAME não cria `/artigos/meu-texto`.
- Planeje a publicação com domínio, DNS, HTTPS, canonical e Search Console, identificando o responsável por cada etapa.
