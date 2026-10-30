# 3 — Segurança no front-end e nas integrações

Execute `index.html` pelo [servidor local](../README.md). Há três experiências locais: texto versus HTML em sandbox, uma decisão CSRF simulada e um exemplo de restauração manual de cookie. Nenhum formulário chama um servidor ou serviço de terceiros.

Nem todos os ataques listados são vulnerabilidades do front-end. A interface pode ser o ponto de entrada, mas as defesas de SQL Injection e SSRF ficam principalmente no servidor; HTTP Request Smuggling envolve servidores e proxies. Os tutoriais distinguem essas responsabilidades.

## Mapa dos ataques

| Ataque | O que acontece | Defesa principal | Nesta aula |
| --- | --- | --- | --- |
| XSS | Entrada não confiável vira código executado na origem da aplicação | Saída adequada ao contexto, sinks seguros e sanitização quando HTML é necessário | Comparação de renderização isolada |
| CSRF | Navegador autenticado envia operação induzida por outra origem | Token ligado à sessão, validação de origem, SameSite e autorização no servidor | Modelo local, sem autenticação real |
| SSRF | Servidor acessa destino influenciado pelo atacante | Destinos permitidos, validação de URL/IP e controle de saída de rede | Tutorial |
| SQL Injection | Entrada altera a estrutura de uma consulta SQL | Consultas parametrizadas e privilégios mínimos | Tutorial |
| MIME Sniffing | Navegador interpreta conteúdo com tipo diferente do pretendido | Content-Type correto e X-Content-Type-Options: nosniff | Tutorial de cabeçalhos |
| HTTP Request Smuggling | Intermediários discordam dos limites de uma mensagem HTTP | Parsers atualizados e configuração coerente entre proxy e origem | Tutorial de infraestrutura |
| Zombie Cookie | Valor apagado reaparece por cópia em outro armazenamento | Respeitar exclusão, eliminar cópias e evitar recriação de identificadores | Restauração manual de preferência fictícia |

## 1. XSS: conceito e experiência

XSS refletido costuma devolver entrada da requisição na resposta; armazenado reapresenta conteúdo previamente salvo; baseado em DOM envolve um fluxo inseguro no código do navegador. As categorias podem se sobrepor. Exemplo de origem de entrada: campo, URL ou conteúdo de API. Exemplo de destino perigoso: `innerHTML` com conteúdo não confiável.

No laboratório, digite `Olá, <strong>turma</strong>!`. À esquerda, `textContent` mostra a entrada literalmente. À direita, o iframe interpreta marcação. Esse iframe tem `sandbox` sem permissões e CSP que bloqueia scripts e recursos externos; ele demonstra a diferença de interpretação, não a execução de um ataque real. Não retire o isolamento para copiar o exemplo para produção.

Tutorial de defesa:

1. Faça um inventário de entradas e dos lugares em que elas são usadas.
2. Para texto, use `textContent`. Construa elementos com APIs DOM, sem concatenar conteúdo arbitrário em HTML.
3. Valide URLs e protocolos antes de atribuir `href` ou `src`; proteção de texto não valida uma URL.
4. Se a aplicação realmente aceita HTML, use um sanitizador mantido, apropriado ao caso, com política explícita. Não tente sanitizar HTML com uma expressão regular.
5. Evite `eval`, `new Function` e handlers montados a partir de texto. Acrescente CSP e, quando compatível, Trusted Types como defesa em camadas.
6. Mantenha dependências atualizadas. Teste a renderização no contexto usado, incluindo componentes e conteúdo de terceiros.

Fonte: [OWASP — prevenção de XSS](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html).

## 2. CSRF: uma decisão que precisa acontecer no servidor

Selecione origem e token no modelo da página. Ele aceita apenas origem confiável com token correspondente à sessão fictícia. O usuário pode alterar JavaScript e DevTools; portanto esse modelo **não protege um endpoint real**.

Tutorial de integração:

1. Não altere estado por GET. Exija sessão e autorização para a operação.
2. Gere no servidor um token imprevisível ligado à sessão, exponha-o à página autorizada e envie-o em campo ou cabeçalho apropriado.
3. No servidor, valide token e origem segundo a arquitetura. Compare origens completas, não uma substring do hostname. Falta de `Origin` não comprova confiança; defina o tratamento com os mecanismos disponíveis e política de rejeição.
4. Configure cookies `Secure`, `HttpOnly` quando aplicável e `SameSite`. Proteções precisam considerar se front e API são cross-origin ou cross-site; esses conceitos são diferentes.
5. Recuse operações sem as verificações necessárias. CORS limita leitura de respostas em cenários entre origens, mas não impede todo envio de requisição. reCAPTCHA também não substitui CSRF.

Pseudocódigo do endpoint, não uma API implementada nesta pasta:

```text
receber POST /preferencias
exigir sessão autenticada e permissão
validar origem segundo a política da aplicação
comparar token recebido com o token da sessão
se faltar validação: rejeitar
validar os dados e aplicar a alteração
```

Fonte: [OWASP — prevenção de CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).

## 3. SSRF: não basta validar a URL no formulário

Um serviço que “importa imagem por URL” pode induzir seu próprio servidor a acessar recursos internos. `fetch` no navegador não reproduz a capacidade de rede do servidor e não demonstra SSRF de back-end.

Tutorial de defesa para um importador:

1. Prefira identificar um fornecedor aprovado a aceitar qualquer URL.
2. Faça o parse com uma biblioteca de URL e permita apenas esquemas e destinos necessários. Rejeite credenciais embutidas e representações inesperadas.
3. Verifique a resolução e os endereços IPv4/IPv6 efetivamente usados; recuse loopback, redes privadas e demais faixas não permitidas conforme a política. Uma regex de hostname é insuficiente.
4. Desative redirecionamentos ou revalide cada destino. Considere DNS rebinding e não separe a verificação do destino da conexão efetiva sem controles adicionais.
5. Restrinja a rede de saída, proteja serviços de metadados e limite tempo, tamanho da resposta e tipos de conteúdo.
6. Teste em ambiente próprio, incluindo redirecionamentos e falhas de resolução. Não implemente um proxy aberto na aplicação da aula.

Fonte: [OWASP — prevenção de SSRF](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html).

## 4. SQL Injection: parametrização no banco

Validar um input em HTML não protege o banco. O atacante pode enviar uma requisição sem passar pela página. Nunca concatene a entrada para construir SQL.

Exemplo ilustrativo no back-end Node com PostgreSQL; este projeto não instala servidor ou driver:

```js
// O driver envia o parâmetro separadamente da estrutura SQL.
const resultado = await pool.query(
  'SELECT id, nome FROM produtos WHERE nome = $1',
  [nomeInformado]
);
```

Tutorial: use parâmetros para valores; nomes de coluna e ordenação dinâmicos devem vir de uma lista de opções mapeadas no código. Valide tipos e limites para a regra de negócio, reduza os privilégios do usuário do banco e não exponha erros internos. Um ORM também pode permitir consultas inseguras se usado com SQL bruto concatenado.

Fonte: [OWASP — prevenção de SQL Injection](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html).

## 5. MIME Sniffing: cabeçalhos da resposta

O navegador pode tentar deduzir o tipo de conteúdo. Servir arquivos com tipo incorreto é especialmente problemático em recursos interpretáveis e uploads. O controle é enviado na resposta HTTP; escrever uma meta tag chamada `X-Content-Type-Options` não substitui o cabeçalho.

Exemplo de trecho Nginx a incorporar ao servidor existente, não um arquivo completo:

```nginx
include mime.types;
default_type application/octet-stream;
add_header X-Content-Type-Options "nosniff" always;
```

Tutorial: configure os tipos corretos para HTML, CSS, JavaScript e dados. Para downloads não destinados à execução, avalie `Content-Disposition: attachment` e isolamento de origem dos uploads. Confira respostas reais com `curl -I` e Network; o servidor simples do Python não aplica os cabeçalhos desta seção automaticamente.

```sh
curl -I https://example.com/app.js
```

Fonte: [MDN — X-Content-Type-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Content-Type-Options).

## 6. HTTP Request Smuggling: proxy e origem

O problema ocorre quando componentes da cadeia interpretam de maneira diferente onde uma requisição termina e outra começa. Ambiguidades de enquadramento, como tratamento inconsistente de comprimento e codificação em HTTP/1.1, são uma origem clássica. Conversões entre versões de HTTP também precisam de atenção. Ativar HTTP/2 apenas na borda não garante que toda a cadeia esteja protegida.

Tutorial operacional:

1. Liste CDN, balanceador, proxy reverso e servidor da aplicação e os protocolos entre eles.
2. Atualize os componentes e aplique as orientações de segurança dos fornecedores.
3. Rejeite mensagens ambíguas e configure normalização consistente. Não repasse cegamente cabeçalhos de enquadramento conflitantes.
4. Observe erros de parser e anomalias de conexão nos logs; teste a integração completa em homologação autorizada.
5. Use laboratórios isolados de estudo para analisar o protocolo. Um formulário HTML estático não substitui essa infraestrutura.

Fonte: [PortSwigger Web Security Academy — HTTP request smuggling](https://portswigger.net/web-security/request-smuggling).

## 7. Zombie Cookie: experimento e remoção

O exemplo grava apenas a preferência fixa `modo-aula`, sem ID pessoal. Clique em Gravar, Apagar só cookie e Restaurar da cópia. O cookie reaparece somente por esse último clique: não há reconstrução automática. Clique em Apagar ambas as cópias para remover cookie e chave de localStorage.

Tutorial de investigação: inspecione cookies, localStorage, IndexedDB e outros locais em que o produto replica identificadores. Ao remover uma conta, revogar consentimento ou apagar dados, elimine as cópias aplicáveis e corrija fluxos que recriam valores indevidamente. Apagar um cookie isolado não elimina cópias em outras APIs. A seleção da ferramenta deve respeitar a decisão de exclusão do usuário.

Fonte: [MDN — cookies, expiração, exclusão e zombie cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies).

## Tutorial: integrar Google reCAPTCHA

O laboratório não carrega o script do Google, não exibe uma caixa fictícia de “proteção ativa” e não possui chaves. A integração completa exige serviço configurado e back-end.

1. Escolha a modalidade oferecida na conta, registre os domínios e siga as instruções atuais do produto. A API e o fluxo de verificação variam entre reCAPTCHA clássico e integrações do Google Cloud/Enterprise.
2. Coloque apenas a chave pública de site no front-end e carregue o script oficial da modalidade escolhida. Mantenha credenciais secretas no servidor.
3. Obtenha o token no fluxo documentado e envie-o ao seu endpoint junto com a operação. O cliente não decide se está autorizado.
4. No back-end, verifique o token no serviço correto. Para a integração clássica, a verificação usa POST para `https://www.google.com/recaptcha/api/siteverify` com `secret` e `response`. Tokens desse fluxo são de uso único e expiram em dois minutos.
5. Confira sucesso e hostname; em modalidades que retornam ação e pontuação, confira a ação esperada e aplique a política de risco. Rejeite tokens inválidos, expirados ou reutilizados e trate falhas do provedor.
6. Só execute a operação após também validar sessão, autorização, CSRF e os dados. Teste sucesso, recusa, falha de rede e alternativas de acesso. reCAPTCHA não elimina XSS, SQL Injection ou fraude de negócio.

Fontes: [verificação no servidor](https://developers.google.com/recaptcha/docs/verify), [reCAPTCHA v3](https://developers.google.com/recaptcha/docs/v3) e [criar avaliações no Google Cloud](https://cloud.google.com/recaptcha/docs/create-assessment-website).

## Tutorial: CDN e WAF

CDN distribui conteúdo e pode armazenar respostas em cache; WAF inspeciona HTTP e aplica regras. Um provedor pode oferecer ambos, com disponibilidade conforme o produto/plano. Nenhum deles corrige sozinho uma vulnerabilidade da aplicação.

1. Escolha um provedor e adicione o domínio que você controla. Cadastre a zona e os registros e revise o impacto da migração de DNS.
2. Ative o proxy/CDN para os hosts atendidos. Configure HTTPS entre visitante e borda e entre borda e origem, com certificado válido.
3. Defina cache para arquivos públicos. Não armazene respostas autenticadas ou personalizadas como se fossem públicas. Confira os cabeçalhos e as regras reais de cache.
4. Habilite o WAF conforme os recursos contratados. Comece observando eventos, ajuste falsos positivos e depois aplique bloqueios e limites com base no comportamento esperado.
5. Teste os formulários legítimos e as regras em ambiente de estudo. Inspecione logs para distinguir bloqueio na borda de erro no back-end.
6. Restrinja acesso direto à origem quando a arquitetura permitir, valide sessões na aplicação e mantenha correções e monitoramento. Caso contrário, parte do tráfego pode contornar a borda.

Fonte: [Cloudflare — WAF](https://developers.cloudflare.com/waf/) e [comportamento de cache](https://developers.cloudflare.com/cache/).

## Exercícios

- Classifique cada ataque por navegador, servidor, banco ou proxy e indique quem implementa a defesa.
- Explique por que `textContent` não previne SQL Injection nem SSRF.
- Descreva um teste de exclusão de dados que detecte restauração indevida de identificadores.
- Projete as camadas de um formulário público: validação, limitação de requisições, CAPTCHA, CSRF e autorização quando houver sessão.
