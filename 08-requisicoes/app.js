/* Um fluxo de interface, três adaptadores de requisição e duas APIs públicas. */
'use strict';
const API = {
  geocoding: 'https://geocoding-api.open-meteo.com/v1/search',
  forecast: 'https://api.open-meteo.com/v1/forecast',
  timeout: 20000
};
const $ = (id) => document.getElementById(id);
const state = { busy: false, abort: null, logs: [] };
const number = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
const statusDescriptions = {
  200: ['OK', 'A requisição foi atendida. Uma busca sem localidades pode retornar 200 com lista vazia; isso não é necessariamente 404.'],
  201: ['Created', 'Um recurso foi criado; a resposta pode indicar sua URL com Location.'],
  202: ['Accepted', 'A solicitação foi aceita, mas o processamento ainda não foi concluído.'],
  204: ['No Content', 'Sucesso sem corpo de resposta. Não tente interpretar um JSON inexistente.'],
  301: ['Moved Permanently', 'Redirecionamento permanente. O cliente pode mudar POST para GET conforme a semântica histórica.'],
  302: ['Found', 'Redirecionamento temporário. O cliente pode mudar POST para GET.'],
  304: ['Not Modified', 'Resposta a uma consulta condicional: a representação em cache pode ser reutilizada. Não é um corpo JSON novo.'],
  307: ['Temporary Redirect', 'Redirecionamento temporário que preserva método e corpo.'],
  308: ['Permanent Redirect', 'Redirecionamento permanente que preserva método e corpo.'],
  400: ['Bad Request', 'A requisição contém algo inválido, como um parâmetro incorreto.'],
  401: ['Unauthorized', 'A autenticação está ausente ou é inválida; normalmente é necessário autenticar.'],
  403: ['Forbidden', 'O servidor recusa o acesso. Autenticar de novo não necessariamente concede permissão.'],
  404: ['Not Found', 'O recurso solicitado não foi encontrado ou o servidor não o expõe.'],
  405: ['Method Not Allowed', 'O recurso não aceita o método usado; o cabeçalho Allow indica métodos permitidos.'],
  409: ['Conflict', 'A operação conflita com o estado atual do recurso.'],
  422: ['Unprocessable Content', 'O formato foi compreendido, mas o conteúdo não pode ser processado segundo as regras da operação.'],
  429: ['Too Many Requests', 'O limite de chamadas foi atingido. Observe Retry-After quando disponível.'],
  500: ['Internal Server Error', 'Falha inesperada ao processar a solicitação no servidor.'],
  502: ['Bad Gateway', 'Um gateway ou proxy recebeu uma resposta inválida do servidor a montante.'],
  503: ['Service Unavailable', 'O serviço está temporariamente indisponível ou sobrecarregado.'],
  504: ['Gateway Timeout', 'Um gateway ou proxy não recebeu resposta a tempo do servidor a montante.']
};
const methodExamples = {
  GET: 'GET /previsoes?cidade=Dois%20Vizinhos\n\nConsulta. Parâmetros na URL; esta aplicação usa GET sem corpo.',
  HEAD: 'HEAD /previsoes\n\nConsulta metadados; a resposta não inclui corpo.',
  POST: 'POST /alertas\nContent-Type: application/json\n\n{"cidade":"Dois Vizinhos"}\n\nSubmete dados. Pode criar um alerta se esse for o contrato do servidor.',
  PUT: 'PUT /preferencias/42\nContent-Type: application/json\n\n{"unidade":"celsius","cidade":"Dois Vizinhos"}\n\nDefine a representação completa no URI escolhido.',
  PATCH: 'PATCH /preferencias/42\nContent-Type: application/merge-patch+json\n\n{"unidade":"celsius"}\n\nExemplo de atualização parcial com formato definido pelo contrato.',
  DELETE: 'DELETE /alertas/42\n\nSolicita remover o recurso. Repetir pode devolver outro status, mantendo o efeito pretendido.',
  OPTIONS: 'OPTIONS /alertas\n\nConsulta opções. No preflight CORS, o navegador também envia cabeçalhos específicos.'
};

function notify(message, error = false) {
  $('status').textContent = message;
  $('status').classList.toggle('error', error);
}
function setBusy(value) {
  state.busy = value;
  $('weather-form').querySelectorAll('input, select, button').forEach((element) => { element.disabled = value; });
  $('cancel').disabled = !value;
  $('locations').querySelectorAll('button').forEach((button) => { button.disabled = value; });
  $('weather-form').setAttribute('aria-busy', String(value));
}
function create(tag, text, className) {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (className) element.className = className;
  return element;
}
function placeName(place) {
  return [...new Set([place.name, place.admin1, place.country].filter(Boolean))].join(' · ');
}
function formatValue(value, unit = '') {
  return typeof value === 'number' && Number.isFinite(value) ? number.format(value) + (unit ? ' ' + unit : '') : 'Não informado';
}
function weatherDescription(code) {
  const names = {
    0: 'Céu limpo', 1: 'Predominantemente limpo', 2: 'Parcialmente nublado', 3: 'Nublado',
    45: 'Nevoeiro', 48: 'Nevoeiro com deposição de gelo', 51: 'Garoa leve', 53: 'Garoa moderada', 55: 'Garoa intensa',
    56: 'Garoa congelante leve', 57: 'Garoa congelante intensa', 61: 'Chuva fraca', 63: 'Chuva moderada', 65: 'Chuva forte',
    66: 'Chuva congelante leve', 67: 'Chuva congelante forte', 71: 'Neve leve', 73: 'Neve moderada', 75: 'Neve intensa',
    77: 'Grãos de neve', 80: 'Pancadas de chuva leves', 81: 'Pancadas de chuva moderadas', 82: 'Pancadas de chuva intensas',
    85: 'Pancadas de neve leves', 86: 'Pancadas de neve fortes', 95: 'Trovoada', 96: 'Trovoada com granizo leve', 99: 'Trovoada com granizo forte'
  };
  return names[code] || 'Condição não informada';
}

function renderLogs() {
  $('request-log').replaceChildren();
  for (const [index, entry] of state.logs.entries()) {
    const item = create('li', undefined, 'request-card');
    const details = create('details');
    const code = entry.status === null ? (entry.error ? 'sem status HTTP acessível' : 'aguardando resposta') : `HTTP ${entry.status}`;
    details.append(create('summary', `${index + 1}. ${entry.label} · ${code}`));
    const elapsed = entry.duration === undefined ? 'em andamento' : `${Math.round(entry.duration)} ms`;
    details.append(create('p', `GET · ${entry.mode} · ${elapsed}`, 'request-meta'));
    const link = create('a', entry.url);
    link.href = entry.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
    const urlLine = create('p', undefined, 'request-meta'); urlLine.append(link); details.append(urlLine);
    const url = new URL(entry.url);
    details.append(create('p', 'Representação textual didática no formato HTTP/1.1; não é uma captura dos bytes da rede.', 'small muted'));
    details.append(create('pre', `GET ${url.pathname}${url.search} HTTP/1.1\nHost: ${url.host}\nAccept: application/json\n\n(sem corpo de requisição)`));
    if (entry.status !== null) details.append(create('p', `Status observado: ${entry.status}. Content-Type: ${entry.contentType || 'não exposto'}.`, 'request-meta'));
    if (entry.error) details.append(create('p', entry.error, 'status error'));
    if (entry.body !== undefined) {
      details.append(create('h3', 'Corpo da resposta'));
      details.append(create('pre', entry.body.slice(0, 50000) + (entry.body.length > 50000 ? '\n[Exibição limitada a 50.000 caracteres]' : '')));
    }
    item.append(details); $('request-log').append(item);
  }
}

function readResponse(response, entry) {
  entry.status = response.status;
  entry.contentType = response.headers.get('content-type');
  return response.text().then((body) => { entry.body = body; return { ok: response.ok, status: response.status, body }; });
}
async function usingAwait(url, entry, controller) {
  const response = await fetch(url, { headers: { Accept: 'application/json' }, signal: controller.signal });
  entry.status = response.status;
  entry.contentType = response.headers.get('content-type');
  const body = await response.text();
  entry.body = body;
  return { ok: response.ok, status: response.status, body };
}
function usingThen(url, entry, controller) {
  return fetch(url, { headers: { Accept: 'application/json' }, signal: controller.signal })
    .then((response) => readResponse(response, entry))
    .catch((error) => { throw error; }); // A interface apresenta a rejeição no mesmo fluxo dos outros modos.
}
function usingXHR(url, entry, controller) {
  // Eventos/callbacks do AJAX clássico, adaptados a uma Promise para a interface comum.
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.setRequestHeader('Accept', 'application/json');
    const abort = () => xhr.abort();
    controller.signal.addEventListener('abort', abort, { once: true });
    const cleanup = () => controller.signal.removeEventListener('abort', abort);
    xhr.onload = () => {
      cleanup(); entry.status = xhr.status; entry.contentType = xhr.getResponseHeader('content-type'); entry.body = xhr.responseText;
      resolve({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, body: xhr.responseText });
    };
    xhr.onerror = () => { cleanup(); reject(new Error('Falha de rede ou bloqueio CORS.')); };
    xhr.onabort = () => { cleanup(); reject(new DOMException('Requisição cancelada.', 'AbortError')); };
    xhr.send();
  });
}
async function requestJSON(url, label) {
  const controller = new AbortController();
  const entry = { url: String(url), label, mode: $('transport').selectedOptions[0].textContent, status: null };
  state.logs.push(entry); renderLogs();
  state.abort = () => controller.abort();
  let timedOut = false;
  const started = performance.now();
  const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, API.timeout);
  try {
    const mode = $('transport').value;
    const response = await (mode === 'xhr' ? usingXHR(url, entry, controller) : mode === 'then' ? usingThen(url, entry, controller) : usingAwait(url, entry, controller));
    let data;
    try { data = response.body ? JSON.parse(response.body) : null; }
    catch (error) { throw new Error(response.ok ? 'O serviço retornou um corpo que não é JSON válido.' : `HTTP ${response.status}: resposta de erro sem JSON válido.`); }
    if (!response.ok) {
      const reason = data && typeof data.reason === 'string' ? data.reason : statusDescriptions[response.status]?.[1] || 'O serviço recusou a requisição.';
      throw new Error(`HTTP ${response.status}: ${reason}`);
    }
    if (data === null || typeof data !== 'object') throw new Error('Resposta JSON vazia ou inválida para esta operação.');
    if (data.error) throw new Error(typeof data.reason === 'string' ? data.reason : 'A API informou um erro.');
    return data;
  } catch (error) {
    const message = controller.signal.aborted ? (timedOut ? 'Tempo limite de 20 segundos excedido.' : 'Requisição cancelada pelo usuário.') :
      error instanceof TypeError ? 'Falha de rede ou bloqueio CORS. Veja o console e a aba Network.' : error.message;
    entry.error = message;
    throw new Error(message);
  } finally {
    clearTimeout(timeout); state.abort = null;
    entry.duration = performance.now() - started; renderLogs();
  }
}
function validPlace(place) {
  return place && typeof place.name === 'string' && typeof place.latitude === 'number' && typeof place.longitude === 'number' &&
    Number.isFinite(place.latitude) && Number.isFinite(place.longitude) && Math.abs(place.latitude) <= 90 && Math.abs(place.longitude) <= 180;
}
function renderPlaces(places) {
  $('locations').replaceChildren();
  for (const place of places) {
    const button = create('button', `${placeName(place)} (${number.format(place.latitude)}, ${number.format(place.longitude)})`);
    button.type = 'button'; button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => loadForecast(place, button));
    $('locations').append(button);
  }
}
async function searchPlaces() {
  const query = $('locality').value.trim();
  if (query.length < 3) { notify('Digite pelo menos três caracteres.', true); return; }
  if (state.busy) return;
  setBusy(true); $('weather').hidden = true; $('locations').replaceChildren();
  state.logs = [];
  notify('Buscando localidades…');
  try {
    const url = new URL(API.geocoding);
    url.search = new URLSearchParams({ name: query, count: '5', language: 'pt', format: 'json' });
    const data = await requestJSON(url, 'Localidades');
    if (data.results !== undefined && !Array.isArray(data.results)) throw new Error('Lista de localidades inválida.');
    const places = (data.results || []).filter(validPlace);
    renderPlaces(places);
    notify(places.length ? 'Escolha a localidade correta para consultar a previsão.' : 'Nenhuma localidade encontrada. Tente outro nome.');
  } catch (error) { notify('Não foi possível buscar a localidade. ' + error.message, true); }
  finally { setBusy(false); }
}
function validateForecast(data) {
  if (!data.current || typeof data.current.time !== 'string' || !data.current_units || !data.daily || !Array.isArray(data.daily.time) || !data.daily.time.length || typeof data.timezone !== 'string') {
    throw new Error('A API retornou uma previsão incompleta.');
  }
  for (const key of ['weather_code', 'temperature_2m_max', 'temperature_2m_min', 'precipitation_probability_max']) {
    if (!Array.isArray(data.daily[key]) || data.daily[key].length !== data.daily.time.length) throw new Error('A API retornou séries de previsão incompatíveis.');
  }
  if (!data.daily.time.every((date) => /^\d{4}-\d{2}-\d{2}$/.test(date))) throw new Error('A API retornou datas inválidas.');
}
function renderForecast(place, data) {
  validateForecast(data);
  $('weather-title').textContent = placeName(place);
  $('weather-meta').textContent = `${data.current.time.replace('T', ' às ')} · ${data.timezone} · grade ${number.format(data.latitude)}, ${number.format(data.longitude)}`;
  $('temperature').textContent = formatValue(data.current.temperature_2m, data.current_units.temperature_2m);
  $('condition').textContent = weatherDescription(data.current.weather_code);
  $('current-details').replaceChildren();
  const metrics = [['Sensação térmica', 'apparent_temperature'], ['Umidade relativa', 'relative_humidity_2m'], ['Vento a 10 m', 'wind_speed_10m'], ['Precipitação no intervalo', 'precipitation']];
  for (const [title, key] of metrics) {
    const group = create('div'); group.append(create('dt', title), create('dd', formatValue(data.current[key], data.current_units[key])));
    $('current-details').append(group);
  }
  $('forecast').replaceChildren();
  data.daily.time.slice(0, 5).forEach((date, index) => {
    // A data diária pertence ao fuso do local: formatar em UTC evita deslocá-la pelo fuso do visitante.
    const label = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', timeZone: 'UTC' }).format(new Date(date + 'T12:00:00Z'));
    const card = create('article');
    card.append(create('h4', label), create('p', weatherDescription(data.daily.weather_code[index])),
      create('strong', `${formatValue(data.daily.temperature_2m_min[index], data.daily_units?.temperature_2m_min || '°C')} / ${formatValue(data.daily.temperature_2m_max[index], data.daily_units?.temperature_2m_max || '°C')}`),
      create('p', `Probabilidade de precipitação: ${formatValue(data.daily.precipitation_probability_max[index], data.daily_units?.precipitation_probability_max || '%')}`));
    $('forecast').append(card);
  });
  $('weather').hidden = false;
}
async function loadForecast(place, selectedButton) {
  if (state.busy) return;
  setBusy(true); $('weather').hidden = true;
  $('locations').querySelectorAll('button').forEach((button) => button.setAttribute('aria-pressed', String(button === selectedButton)));
  notify('Consultando a previsão para ' + placeName(place) + '…');
  try {
    const url = new URL(API.forecast);
    url.search = new URLSearchParams({ latitude: String(place.latitude), longitude: String(place.longitude),
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
      timezone: 'auto', forecast_days: '5' });
    const data = await requestJSON(url, 'Previsão do tempo');
    renderForecast(place, data);
    notify('Previsão recebida. Compare as duas chamadas no diário ou no DevTools.');
  } catch (error) { notify('Não foi possível consultar a previsão. ' + error.message, true); }
  finally { setBusy(false); }
}

$('weather-form').addEventListener('submit', (event) => {
  // O botão de comparação mantém a navegação HTML nativa; os demais modos usam AJAX.
  if (event.submitter?.id === 'native-submit') return;
  event.preventDefault(); searchPlaces();
});
$('cancel').addEventListener('click', () => state.abort?.());
$('locality').addEventListener('input', () => {
  $('locations').replaceChildren(); $('weather').hidden = true;
  notify('Localidade alterada. Envie o formulário para buscar novamente.');
});
$('method-example').addEventListener('change', () => { $('method-output').textContent = methodExamples[$('method-example').value]; });
$('method-output').textContent = methodExamples.GET;
for (const [code, [name]] of Object.entries(statusDescriptions)) {
  const option = create('option', `${code} · ${name}`); option.value = code; $('status-example').append(option);
}
function showStatus() { const [name, explanation] = statusDescriptions[$('status-example').value]; $('status-explanation').textContent = `${$('status-example').value} ${name} — ${explanation}`; }
$('status-example').addEventListener('change', showStatus); showStatus();
