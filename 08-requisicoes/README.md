# 08 — Requisições HTTP: do formulário à previsão do tempo

**Tempo de Requisição** é uma aplicação em HTML, CSS e JavaScript puro para estudar uma comunicação real com APIs. O usuário envia uma localidade, escolhe o resultado correto e recebe as condições atuais do modelo meteorológico e a previsão de cinco dias. A página apresenta métodos, status, protocolos, sockets, servidores e a evolução de submit para AJAX e Promises.

O que funciona no navegador foi implementado no exemplo. O que exige sistema operacional, servidor, certificado ou configuração de infraestrutura aparece como **tutorial** neste README. Não há um back-end próprio, servidor TCP ou endpoint de escrita escondido no projeto.

## Executar

Na raiz do repositório:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Abra http://localhost:8000/08-requisicoes/. O Live Server também funciona. Use HTTP local em vez de abrir por `file://`. Não é necessário instalar pacotes, compilar código ou fornecer chave. A consulta de localidades e previsão exige internet e disponibilidade dos serviços externos.

O servidor simples do Python serve os arquivos da aula. As consultas meteorológicas saem **do navegador para a Open-Meteo**, sem passar por esse servidor local. A configuração de HTTPS e os exemplos de Nginx, Apache e Tomcat abaixo não são aplicados automaticamente pelo comando Python.

## Visão geral do exemplo

```text
                            navegação inicial
Navegador ─────────────────────────────────────────> servidor local
          <──────────── index.html, style.css, app.js

                            consultas da aplicação
Nome da localidade ─── GET ──> API de geocodificação Open-Meteo
Lista de localidades <─ JSON ─
          │ usuário seleciona a localidade
          ▼
Latitude/longitude ─── GET ──> API de previsão Open-Meteo
Condições + 5 dias <── JSON ──
          │
          ▼
Atualização do DOM + diário de requisições
```

A previsão da Open-Meteo recebe **coordenadas**. Por isso, a aplicação primeiro converte o nome em localidades candidatas, em vez de presumir que a primeira cidade encontrada é a desejada. Cidades com nomes iguais são diferenciadas por região e país.

### Arquivos e responsabilidades

| Arquivo | Responsabilidade |
| --- | --- |
| `index.html` | Formulário, previsão, diário e conteúdo didático semântico |
| `style.css` | Layout responsivo, tabelas, cartões e estados visuais |
| `app.js` | Construção de URLs, três adaptadores HTTP, tratamento de erros, validação e DOM |
| `assets/icon.svg` | Ícone vetorial local |
| `README.md` | Explicação integral, tutoriais de infraestrutura e roteiro de verificação |

### Como usar

1. Digite pelo menos três caracteres de uma localidade, como `Dois Vizinhos`.
2. Selecione Fetch com async/await, Fetch com `.then()` ou XMLHttpRequest.
3. Clique em Buscar localidade e escolha o resultado com a região e o país corretos.
4. Veja temperatura, sensação térmica, umidade, vento, precipitação e previsão diária.
5. Expanda as entradas do diário para examinar URL, método, duração, status, Content-Type e corpo da resposta.
6. Repita com outro adaptador e compare o Network. O contrato HTTP é equivalente; o código JavaScript usado para lidar com a resposta muda.
7. Use o botão de comparação de submit para abrir o JSON da busca em outra aba, por navegação HTML nativa. Isso não apresenta a previsão formatada nessa outra aba.

A aplicação não consulta a cada tecla, não usa geolocalização e não armazena a busca em cookies ou Web Storage. Editar o nome remove resultados e previsão anteriores. Durante uma chamada, os controles ficam bloqueados, com Cancelar disponível. Uma consulta nova substitui o diário; a busca inicial e as previsões subsequentes da mesma lista permanecem nele até a próxima busca.

### O que o código faz

- `searchPlaces()` gera a URL de geocodificação com `URL` e `URLSearchParams`, lê `results`, valida nomes/coordenadas e cria botões de seleção.
- `loadForecast()` envia latitude, longitude, variáveis atuais e diárias, `timezone=auto` e `forecast_days=5` à API de previsão.
- `requestJSON()` centraliza timeout de 20 segundos, cancelamento, registro da chamada, interpretação do JSON e erros.
- `usingAwait()` usa Fetch com `await`; `usingThen()` usa encadeamento de Promises; `usingXHR()` usa eventos de XMLHttpRequest e os adapta a uma Promise para compartilhar a interface.
- `renderForecast()` verifica a estrutura e as séries diárias antes de apresentar os dados. Valores ausentes aparecem como “Não informado”, sem inventar uma temperatura ou converter `null` em zero.
- O diário distingue erro HTTP de falha sem status acessível. A duração mede a operação observada no JavaScript, não apenas tempo de rede.
- Conteúdo do serviço e entradas do usuário são apresentados com `textContent`, sem interpolação de conteúdo externo em `innerHTML`.

Condições atuais são valores de modelos, não uma promessa de medição de uma estação no local. O horário exibido e as datas diárias seguem o fuso retornado pela API. A grade meteorológica pode estar próxima, mas não exatamente sobre a coordenada geocodificada. Os códigos meteorológicos WMO são traduzidos em descrições; códigos desconhecidos recebem uma descrição de indisponibilidade.

### APIs reais e atribuição

Geocodificação:

```text
GET https://geocoding-api.open-meteo.com/v1/search?name=Dois%20Vizinhos&count=5&language=pt&format=json
```

Previsão, com coordenadas ilustrativas da região:

```text
GET https://api.open-meteo.com/v1/forecast?latitude=-25.75&longitude=-53.06&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=5
```

A aplicação usa os endpoints públicos da [Open-Meteo](https://open-meteo.com/), com localidades baseadas em [GeoNames](https://www.geonames.org/). O uso gratuito deste exemplo é didático e não comercial, sujeito aos [termos e limites atuais](https://open-meteo.com/en/terms). Confira condições e planos antes de reutilizar comercialmente. A página mostra atribuição e links; a API recebe a localidade/coordenadas e dados de conexão. Não há contratação ou publicação automática.

Fontes: [API de geocodificação](https://open-meteo.com/en/docs/geocoding-api) e [API de previsão, variáveis e códigos meteorológicos](https://open-meteo.com/en/docs).

## Como nasce uma requisição HTTP

Uma navegação, link, formulário, imagem, CSS, script ou chamada JavaScript pode demandar um recurso. Antes de sair para a rede, o navegador pode aproveitar cache, consultar um service worker, aplicar políticas ou reutilizar uma conexão. Assim, observar uma operação na página não significa que todos os passos de conexão serão repetidos.

Quando necessário, o navegador resolve o hostname, estabelece o transporte, negocia a proteção e transmite a mensagem HTTP. Uma borda, proxy ou aplicação escolhe o recurso e produz uma resposta. O navegador interpreta o conteúdo ou o disponibiliza ao JavaScript. Redirecionamentos podem gerar outras requisições; cache pode evitar parte do trabalho.

Uma requisição tem método, destino, cabeçalhos e, quando previsto, corpo. A resposta tem status, cabeçalhos e, quando previsto, corpo. Em HTTP/1.1 há uma representação textual com linha inicial; HTTP/2 e HTTP/3 usam enquadramento binário e outra codificação dos metadados.

O diário exibe uma **representação didática em HTTP/1.1**, não uma captura literal dos bytes enviados. Cabeçalhos como Host/`:authority`, origem e vários controles são administrados pelo navegador. A aplicação não mede o IP remoto, handshake TCP, certificado ou versão negociada; veja esses dados no DevTools quando estiverem disponíveis.

Fonte: [MDN — visão geral de HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview).

## Métodos HTTP e REST

REST é um estilo arquitetural, não uma lista de verbos. Uma API que usa GET e POST pode ou não seguir suas restrições. HTTP define a semântica dos métodos independentemente de REST.

| Método | Intenção comum | Safe | Idempotente |
| --- | --- | --- | --- |
| GET | Obter uma representação | Sim | Sim |
| HEAD | Obter metadados sem corpo de resposta | Sim | Sim |
| POST | Submeter dados para processamento, às vezes criando recurso | Não | Não garantido |
| PUT | Criar/substituir o estado do recurso no URI especificado | Não | Sim |
| PATCH | Aplicar modificações parciais com formato acordado | Não | Não garantido |
| DELETE | Solicitar remoção do recurso | Não | Sim |
| OPTIONS | Obter opções de comunicação | Sim | Sim |

Safe não solicita alteração de estado; logs e métricas ainda podem existir. Idempotência se refere ao mesmo efeito pretendido ao repetir a operação, não à igualdade do status ou do corpo. Uma segunda exclusão pode retornar 404 e continuar idempotente. Um contrato pode tornar uma operação PATCH idempotente; não se deve presumir isso genericamente.

A aplicação envia somente GET, sem corpo. Os exemplos de outros métodos na página são **modelos locais**, não endpoints existentes da API de tempo. HTML de formulário usa normalmente GET ou POST para envio HTTP; PUT/PATCH/DELETE exigem outro mecanismo, como Fetch, ou uma convenção explicitamente implementada no servidor.

Fonte: [MDN — métodos HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods).

## Códigos de retorno populares

| Família/código | Interpretação |
| --- | --- |
| 1xx | Informação e etapas intermediárias do protocolo |
| 200 | Sucesso; o significado do corpo depende da operação |
| 201 / 202 / 204 | Criado / aceito para processamento / sucesso sem corpo |
| 301 / 302 | Redirecionamento permanente / temporário; POST pode mudar para GET |
| 304 | Validação de cache: reutilize a representação disponível |
| 307 / 308 | Redirecionamento temporário / permanente preservando método e corpo |
| 400 | Requisição inválida |
| 401 / 403 | Problema de autenticação / acesso recusado |
| 404 / 405 | Recurso não encontrado / método não permitido |
| 409 / 422 | Conflito com estado / conteúdo não processável |
| 429 | Excesso de chamadas |
| 500 | Falha interna |
| 502 / 503 / 504 | Resposta inválida a montante / indisponibilidade / timeout no gateway |

A busca de uma cidade inexistente pode devolver **200 com resultados ausentes ou vazios**. A URL do recurso continua válida. Fetch resolve sua Promise quando recebe uma resposta HTTP como 404 ou 500; o código precisa verificar `response.ok`. Falha de DNS, conexão, CORS ou cancelamento pode resultar em rejeição sem status HTTP acessível ao script. Status `0` observado em XHR nessas falhas não é um código de resposta HTTP do servidor.

Não execute `response.json()` indiscriminadamente em uma resposta sem corpo, como 204. Fetch normalmente segue redirecionamentos e pode apresentar a resposta final; ferramentas e navegador também administram a validação de cache. O seletor de códigos é didático e não força a API externa a responder com o código escolhido.

Fonte: [MDN — códigos de status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status).

## Do submit ao AJAX e às Promises

### Submit nativo

O formulário tem `action`, `method="get"`, campo `name` e parâmetros ocultos. No botão de comparação, o handler não chama `preventDefault()` e o navegador realiza a navegação em outra aba. Com JavaScript desativado, o envio também permite consultar o JSON de localidades. Esse submit nativo não é registrado no diário JavaScript: observe a navegação e seus dados na aba Network da nova página.

GET codifica os campos bem-sucedidos na query string. POST normalmente leva os dados do formulário no corpo, conforme `enctype`. Isso não torna o conteúdo secreto: use HTTPS e evite enviar segredos em URLs. Validação HTML ajuda a experiência, mas o servidor sempre precisa validar os dados.

### AJAX com XMLHttpRequest

AJAX é a técnica de atualizar partes da página por comunicação assíncrona. O nome tem XML por razões históricas; JSON também é comum. XHR expõe eventos como `load`, `error` e `abort`. `load` não garante status 2xx: a verificação permanece necessária.

Nesta aplicação, os callbacks de XHR resolvem ou rejeitam uma Promise usada pelo fluxo comum. Isso não significa que XMLHttpRequest, por si só, retorne uma Promise. Fonte: [MDN — usando XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest_API/Using_XMLHttpRequest).

### Fetch, Promise e async/await

Promise representa um resultado futuro, que pode resolver ou rejeitar. `.then()` encadeia trabalho e `.catch()` lida com rejeições; `async/await` é uma sintaxe para trabalhar com Promises. `await` suspende a execução daquela função assíncrona, não bloqueia todo o navegador nem cria um novo protocolo de rede.

O código de produção da aula lê o corpo como texto para registrá-lo no diário, depois aplica `JSON.parse`. Nos pequenos trechos didáticos da página, `response.json()` ilustra a forma habitual. Em ambos os casos, ler/interpretar o corpo pode falhar e uma resposta 2xx pode ser inválida para o contrato da aplicação.

Cancelar interrompe a espera do cliente por `AbortController` ou `xhr.abort()`. Isso não garante desfazer o trabalho já iniciado no servidor. Não há retry automático que possa duplicar operações. Fonte: [MDN — usando Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch).

## TCP/IP, HTTP e HTTPS

IP trata endereçamento e transporte de pacotes entre redes. TCP fornece um fluxo confiável e ordenado, com mecanismos de controle de conexão, entrega e congestionamento. HTTP define as mensagens e semântica da aplicação; HTTPS protege essa comunicação com TLS, incluindo verificação do certificado do servidor.

| Comunicação típica | Camadas relevantes |
| --- | --- |
| HTTP/1.1 sem TLS | HTTP → TCP → IP |
| HTTPS com HTTP/1.1 ou HTTP/2 | HTTP → TLS → TCP → IP |
| HTTPS com HTTP/3 | HTTP/3 → QUIC, com TLS integrado → UDP → IP |

As portas convencionais são 80 para HTTP e 443 para HTTPS, mas a URL pode especificar outra porta. Um servidor local desta aula atende 8000. HTTPS não significa que a página seja honesta ou que seus dados sejam corretos: protege a conexão com a identidade validada no certificado.

Conexões podem ser mantidas e reutilizadas. HTTP/2 multiplexa streams; HTTP/3 usa QUIC sobre UDP. Portanto, “um fetch abre um TCP novo” não é uma regra. Fonte: [MDN — evolução do HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Evolution_of_HTTP).

### Tutorial de leitura do estabelecimento da conexão

Para uma conexão HTTPS nova com HTTP/1.1 ou HTTP/2, use o painel Timing ou uma ferramenta de rede autorizada para relacionar as etapas:

1. **DNS:** o nome precisa ser associado a um destino, aproveitando cache quando disponível.
2. **TCP:** o estabelecimento clássico usa SYN, SYN-ACK e ACK entre endpoints. Isso prepara o fluxo; ainda não é o corpo da resposta HTTP.
3. **TLS:** cliente e servidor negociam proteção, verificam a identidade conforme o certificado e estabelecem chaves da conexão. A versão de HTTP pode ser negociada nesse processo.
4. **HTTP:** seguem a requisição e a resposta sobre a conexão protegida.
5. **Reutilização:** chamadas posteriores podem compartilhar a conexão; não espere ver novamente todas as fases. HTTP/3 utiliza outro estabelecimento, baseado em QUIC, em vez do handshake TCP descrito acima.

A página não captura esses pacotes nem confirma que cada fase ocorreu nessa consulta específica. Para observar tráfego detalhado, trabalhe apenas na sua própria máquina/rede e interprete as limitações de criptografia e captura da ferramenta escolhida.

## Sockets: cliente, sistema operacional e servidor

Socket é uma interface de comunicação do sistema operacional. Num servidor TCP, o programa faz bind em um endereço/porta, escuta e aceita conexões. O socket de escuta continua recebendo novas conexões; cada socket conectado representa uma comunicação específica.

Uma conexão TCP pode ser identificada pelos IPs e portas dos dois lados. O cliente normalmente recebe uma porta efêmera; o servidor usa uma porta de escuta conhecida. Os sistemas operacionais de ambas as máquinas administram esses recursos. NAT, proxies e balanceadores podem mudar o que cada lado observa.

Exemplo **fictício**, com endereços de documentação:

```text
Cliente:  192.0.2.10:53142  ⇄  Servidor: 198.51.100.20:443
Cliente:  192.0.2.11:54001  ⇄  Servidor: 198.51.100.20:443
```

Muitos clientes podem usar a mesma porta do servidor porque as conexões não são identificadas apenas por essa porta. O navegador é um processo cliente; Nginx, Apache ou outro serviço pode ser o processo servidor. Uma chamada HTTP pode passar por vários intermediários antes de chegar à aplicação.

JavaScript de uma página comum não oferece sockets TCP brutos nem permite escolher livremente cabeçalhos e portas de origem. Fetch e XHR delegam isso ao navegador. **WebSocket** fornece uma comunicação de mensagens persistente por uma API própria; não é sinônimo de socket TCP nem é obrigatório para HTTP. Esta aplicação usa requisição/resposta, não WebSocket. Fonte: [MDN — WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API).

## Tutorial: observar rede e conexões

Estas ações exigem DevTools ou terminal; a página não as executa.

1. Abra Network antes da busca. Filtre por Fetch/XHR e faça a consulta.
2. Inspecione método, URL, query string, status, Response e Content-Type. Veja as duas origens da API: geocodificação e previsão.
3. Ative as colunas Protocol e Remote Address quando disponíveis. Timing pode revelar DNS, conexão, TLS, espera e transferência; etapas podem estar ausentes por reutilização de conexão, cache ou limitações da ferramenta.
4. Use Offline para ver erro de rede e Cancelar para observar aborto. Volte online antes da próxima consulta.
5. No terminal, consulte o JSON e os cabeçalhos com curl. `-i` faz o GET real e inclui os cabeçalhos; `-I` enviaria HEAD, uma operação diferente.

```sh
curl -i --get 'https://geocoding-api.open-meteo.com/v1/search' \
  --data-urlencode 'name=Dois Vizinhos' \
  --data 'count=5&language=pt&format=json'

# Detalhes de conexão/TLS, sem desabilitar validação do certificado:
curl -v --get 'https://geocoding-api.open-meteo.com/v1/search' \
  --data-urlencode 'name=Dois Vizinhos' \
  --data 'count=1&language=pt&format=json'

# Linux: sockets TCP de escuta e conexões estabelecidas.
ss -ltn
ss -tn
```

O curl não aplica a política de CORS do navegador. Sucesso no terminal não garante que JavaScript possa ler a resposta. Não use `-k` para esconder problemas de certificado. No terminal, a listagem de conexões é um retrato momentâneo e pode não mostrar uma consulta curta.

## Tutorial: um servidor TCP que fala um pouco de HTTP

Não é possível implementar um servidor TCP de escuta dentro desta página comum. Para observar `bind`, `listen` e `accept`, salve o trecho abaixo como um arquivo Python separado em um ambiente de estudo e execute-o. **Esse arquivo não é necessário para a aplicação meteorológica.**

```python
import socket

corpo = 'Olá, HTTP!\n'.encode('utf-8')
with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as servidor:
    servidor.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    servidor.bind(('127.0.0.1', 8081))
    servidor.listen()
    print('Escutando em http://127.0.0.1:8081')
    while True:
        conexao, cliente = servidor.accept()
        with conexao:
            conexao.settimeout(5)
            try:
                cabecalhos = b''
                while b'\r\n\r\n' not in cabecalhos:
                    parte = conexao.recv(1024)
                    if not parte:
                        break
                    cabecalhos += parte
                    if len(cabecalhos) > 8192:
                        raise ValueError('Cabeçalhos grandes para este exercício')
                if b'\r\n\r\n' not in cabecalhos:
                    continue
                print(cliente, cabecalhos.split(b'\r\n', 1)[0])
                resposta = (
                    'HTTP/1.1 200 OK\r\n'
                    'Content-Type: text/plain; charset=utf-8\r\n'
                    f'Content-Length: {len(corpo)}\r\n'
                    'Connection: close\r\n\r\n'
                ).encode('ascii') + corpo
                conexao.sendall(resposta)
            except (OSError, ValueError) as erro:
                print('Conexão encerrada:', erro)
```

Teste com `curl -i http://127.0.0.1:8081/`. O fluxo TCP pode chegar em vários blocos; um `recv()` não equivale a uma requisição completa. O exemplo acumula até o fim dos cabeçalhos, atende uma conexão por vez e fecha após responder. É um demonstrador mínimo para GET via curl, sem parser HTTP completo, TLS, keep-alive, tratamento de corpos ou concorrência. Não deve ser usado como servidor de produção nem como implementação de todos os métodos HTTP.

Fonte para as operações de socket: [documentação oficial do Python](https://docs.python.org/3/library/socket.html).

## Tutorial: CORS, origem e preflight

As APIs estão em origens diferentes da página. Para o JavaScript ler respostas entre origens, o servidor precisa enviar os cabeçalhos CORS apropriados. Esses GETs usam `Accept: application/json`, sem credenciais ou cabeçalhos personalizados que, sozinhos, exijam preflight.

1. Confira `Origin` na requisição e `Access-Control-Allow-Origin` na resposta no DevTools. O provedor é quem controla a permissão.
2. Em uma API própria, permita apenas origens, métodos e cabeçalhos exigidos pelo contrato. Requisições com credenciais têm regras adicionais; `*` não serve como permissão de origem para leitura com credenciais.
3. Métodos/cabeçalhos fora das condições de uma requisição simples podem provocar um OPTIONS de preflight antes da requisição efetiva.
4. Não tente corrigir CORS colocando `Access-Control-Allow-Origin` no cabeçalho da requisição ou usando `mode: 'no-cors'`: uma resposta opaca não oferece o JSON ao código.
5. Não use proxies públicos desconhecidos para contornar a política. Se uma integração exigir segredo ou não permitir CORS, projete uma integração no seu back-end.

Fonte: [MDN — CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS).

## Servidores web: diferenças e tutoriais

Servidor web é o programa que recebe HTTP; servidor de aplicação pode executar a lógica do sistema. Um produto pode atender vários papéis. Uma máquina física ou virtual pode hospedar múltiplos serviços; “servidor” pode designar a máquina ou o processo, dependendo do contexto.

| Tecnologia | Uso comum | Referência |
| --- | --- | --- |
| Nginx | Conteúdo estático, proxy reverso, TLS e distribuição de tráfego | [Processamento de requisições](https://nginx.org/en/docs/http/request_processing.html) |
| Apache HTTP Server | HTTP, virtual hosts, módulos e integração com aplicações | [Guia inicial](https://httpd.apache.org/docs/2.4/getting-started.html) |
| Apache Tomcat | Contêiner Jakarta Servlet/JSP, com conectores HTTP para aplicações Java | [Introdução](https://tomcat.apache.org/tomcat-11.0-doc/introduction.html) |
| Caddy | Servidor HTTP e proxy com gestão de HTTPS | [Documentação](https://caddyserver.com/docs/) |
| Microsoft IIS | Hospedagem e recursos HTTP no ambiente Windows | [Documentação](https://learn.microsoft.com/en-us/iis/) |
| Node.js / Kestrel | Aplicações podem atender HTTP diretamente | [Node HTTP](https://nodejs.org/api/http.html) / [Kestrel](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel) |

Tomcat não é outro nome do Apache HTTP Server. Nginx pode servir o front-end e encaminhar `/api/` para Tomcat ou outro processo. Esta é uma arquitetura possível; a aplicação não descobre qual software atende internamente a Open-Meteo.

### Nginx: servir os arquivos da aula

Com Nginx instalado, adapte o caminho e acrescente um bloco à configuração apropriada do seu ambiente. O trecho é ilustrativo, não instala nem modifica seu servidor automaticamente:

```nginx
server {
    listen 8080;
    server_name localhost;
    root /CAMINHO/ABSOLUTO/PARA/pw/08-requisicoes;
    index index.html;
    location / {
        try_files $uri $uri/ =404;
    }
}
```

Valide com `nginx -t`, recarregue pelo mecanismo do sistema e abra `http://localhost:8080/`. Confira acesso e erros nos logs. Nesse exemplo a aplicação fica na raiz desse virtual host, mantendo seus links relativos.

Para uma API própria já existente em `127.0.0.1:8081`, um proxy poderia usar um bloco `location /api/` com `proxy_pass http://127.0.0.1:8081/;`. A barra final influencia o caminho encaminhado. Defina explicitamente o contrato, cabeçalhos de encaminhamento confiáveis e timeouts; não transforme isso em proxy aberto de URLs arbitrárias. O servidor TCP didático acima não é um back-end adequado para esse cenário de produção.

### Apache HTTP Server: servir os arquivos

Com Apache instalado, adapte um virtual host local:

```apache
Listen 8082
<VirtualHost *:8082>
    ServerName localhost
    DocumentRoot "/CAMINHO/ABSOLUTO/PARA/pw/08-requisicoes"
    <Directory "/CAMINHO/ABSOLUTO/PARA/pw/08-requisicoes">
        Require all granted
        DirectoryIndex index.html
        AllowOverride None
        Options -Indexes
    </Directory>
</VirtualHost>
```

Não duplique `Listen` se a porta já estiver configurada. Valide com `apachectl configtest` ou a ferramenta equivalente da instalação, recarregue e abra `http://localhost:8082/`. Examine os logs e os tipos MIME servidos. Configuração de proxy requer módulos e regras adicionais.

### Tomcat: conteúdo e aplicações Java

1. Instale JDK e Tomcat em versões compatíveis conforme a documentação do produto.
2. Para estudar entrega de estáticos, copie a pasta da aula para `$CATALINA_BASE/webapps/requisicoes/` em um ambiente local controlado, com as permissões adequadas.
3. Inicie o Tomcat pelo procedimento da instalação e abra o contexto `/requisicoes/` na porta configurada, frequentemente 8080. Confira os logs e possíveis conflitos de porta.
4. Para lógica Java, crie e publique uma aplicação Servlet/JSP compatível com aquela versão; apenas copiar JavaScript do navegador não o transforma em servlet.
5. Se usar Nginx ou Apache na frente, configure o proxy para o contexto correto e as informações de encaminhamento necessárias. HTTPS e autenticação precisam de configuração explícita.

### HTTPS: algo que o HTML não habilita sozinho

1. Tenha um hostname e acesso à configuração da borda/servidor.
2. Obtenha um certificado confiável para esse hostname e configure certificado, cadeia e chave privada no serviço TLS, seguindo a documentação do servidor ou hospedagem.
3. Publique em HTTPS, teste renovação e redirecionamento HTTP → HTTPS. Uma chave privada nunca deve ir para a pasta pública.
4. Use HTTPS também nas chamadas de API, como neste exemplo, e evite mixed content. Se houver proxy, planeje a proteção entre a borda e a origem.
5. Para estudo local, use certificado de desenvolvimento instalado de modo apropriado; `http://localhost` não é uma conexão criptografada por ser aceito como contexto potencialmente confiável em algumas APIs do navegador.

## Roteiro de verificação e exercícios

- Consulte Dois Vizinhos nos três modos e compare as URLs e os dados.
- Pesquise um nome ambíguo e selecione explicitamente a região correta.
- Teste localidade inexistente, Offline, cancelamento e JSON/HTTP inválidos em ambiente de teste. Falhas não devem deixar previsão anterior visível ou controles permanentemente bloqueados.
- Navegue com teclado, confira mensagens anunciadas e teste uma tela estreita.
- Desative JavaScript e use o submit nativo para observar o JSON sem atualização parcial da página.
- Explique por que o formulário de busca usa GET e por que um formulário de criar alertas poderia usar POST em uma API própria.
- Diferencie 401, 403, 404 e uma falha sem resposta HTTP acessível.
- Explique onde ficam cliente, socket de escuta, conexão aceita, servidor web e aplicação no exemplo de proxy.
- Investigue se houve conexão nova ou reutilização no DevTools e explique por que a aplicação não pode presumir TCP novo para cada chamada.

As explicações e referências foram consultadas em 30/10/2026. Provedores, suporte de protocolo e versões de servidores podem mudar; use a documentação da versão instalada e os termos atuais da API.
