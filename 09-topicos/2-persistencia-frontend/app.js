'use strict';
const NOTE_KEY = 'pw08:persistencia:nota';
const COOKIE_KEY = 'pw08_nota';
const DB_NAME = 'pw08-persistencia';
const cookiePath = location.pathname.slice(0, location.pathname.lastIndexOf('/') + 1);
const status = document.getElementById('status');
let database;
function openDatabase() {
  if (database) return database;
  database = new Promise((resolve, reject) => {
    if (!window.indexedDB) { reject(new Error('IndexedDB indisponível.')); return; }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('notas', { keyPath: 'id' });
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => { db.close(); database = undefined; };
      resolve(db);
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () => { status.textContent = 'Feche outras abas desta aula para liberar o banco.'; };
  }).catch((error) => { database = undefined; throw error; });
  return database;
}
async function dbAction(action, value) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('notas', action === 'read' ? 'readonly' : 'readwrite');
    const store = transaction.objectStore('notas');
    const request = action === 'read' ? store.get('aula') : action === 'save' ?
      store.put({ id: 'aula', texto: value, atualizadoEm: new Date().toISOString() }) : store.delete('aula');
    let result = null;
    request.onsuccess = () => { result = request.result?.texto ?? null; };
    transaction.oncomplete = () => resolve(result);
    transaction.onerror = () => reject(transaction.error || request.error);
    transaction.onabort = () => reject(transaction.error || new Error('Transação cancelada.'));
  });
}
function readCookie() {
  const pair = document.cookie.split('; ').find((item) => item.startsWith(COOKIE_KEY + '='));
  return pair ? decodeURIComponent(pair.slice(COOKIE_KEY.length + 1)) : null;
}
const stores = {
  session: { name: 'sessionStorage', save: (v) => sessionStorage.setItem(NOTE_KEY, v), read: () => sessionStorage.getItem(NOTE_KEY), remove: () => sessionStorage.removeItem(NOTE_KEY) },
  local: { name: 'localStorage', save: (v) => localStorage.setItem(NOTE_KEY, v), read: () => localStorage.getItem(NOTE_KEY), remove: () => localStorage.removeItem(NOTE_KEY) },
  cookie: { name: 'Cookie de 7 dias', save(value) {
    if (encodeURIComponent(value).length > 500) throw new Error('Nota grande para o cookie didático: reduza para até 500 caracteres codificados.');
    document.cookie = `${COOKIE_KEY}=${encodeURIComponent(value)}; Max-Age=604800; Path=${cookiePath}; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
    if (readCookie() !== value) throw new Error('O navegador não aceitou o cookie.');
  }, read: readCookie, remove() { document.cookie = `${COOKIE_KEY}=; Max-Age=0; Path=${cookiePath}; SameSite=Lax`; } },
  indexed: { name: 'IndexedDB', save: (v) => dbAction('save', v), read: () => dbAction('read'), remove: () => dbAction('remove') }
};
async function run(key, action) {
  document.querySelectorAll('button').forEach((button) => { button.disabled = true; });
  try {
    const store = stores[key];
    if (action === 'save') await store.save(document.getElementById('nota').value);
    if (action === 'remove') await store.remove();
    const value = await store.read();
    document.getElementById(key + '-value').textContent = value === null ? 'Nenhuma nota salva.' : value || '(nota vazia)';
    if (action === 'read' && value !== null) document.getElementById('nota').value = value;
    status.textContent = `${store.name}: ${action === 'save' ? 'nota salva' : action === 'remove' ? 'nota apagada' : 'leitura concluída'}.`;
  } catch (error) { status.textContent = 'Não foi possível acessar o armazenamento. ' + error.message; }
  finally { document.querySelectorAll('button').forEach((button) => { button.disabled = false; }); }
}
for (const [key, store] of Object.entries(stores)) {
  const card = document.createElement('article');
  const heading = document.createElement('h3'); heading.textContent = store.name; card.append(heading);
  for (const [action, label] of [['save', 'Salvar'], ['read', 'Ler'], ['remove', 'Apagar']]) {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = label;
    button.setAttribute('aria-label', `${label} em ${store.name}`);
    button.addEventListener('click', () => run(key, action)); card.append(button);
  }
  const output = document.createElement('output'); output.id = key + '-value'; output.textContent = 'Clique em Ler para consultar.';
  card.append(output); document.getElementById('stores').append(card);
}
document.getElementById('clear-all').addEventListener('click', async () => {
  document.querySelectorAll('button').forEach((button) => { button.disabled = true; });
  const errors = [];
  for (const [key, store] of Object.entries(stores)) {
    try { await store.remove(); document.getElementById(key + '-value').textContent = 'Nenhuma nota salva.'; }
    catch (error) { errors.push(store.name + ': ' + error.message); }
  }
  document.getElementById('nota').value = '';
  document.querySelectorAll('button').forEach((button) => { button.disabled = false; });
  status.textContent = errors.length ? 'Alguns dados não puderam ser apagados. ' + errors.join(' ') : 'Somente os dados desta aula foram apagados.';
});
