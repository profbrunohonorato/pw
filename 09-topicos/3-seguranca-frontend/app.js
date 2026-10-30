'use strict';
function compareComment() {
  const value = document.getElementById('comment').value;
  document.getElementById('safe-comment').textContent = value;
  // Defesa em camadas: origem opaca do sandbox, sem scripts e sem recursos externos.
  document.getElementById('html-comment').srcdoc = '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'none\'; style-src \'none\'; base-uri \'none\'; form-action \'none\'"></head><body>' + value + '</body></html>';
}
document.getElementById('comment-form').addEventListener('submit', (event) => { event.preventDefault(); compareComment(); });
compareComment();
document.getElementById('csrf-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const sameOrigin = document.getElementById('csrf-origin').value === 'same';
  const validToken = document.getElementById('csrf-token').value === 'valid';
  document.getElementById('csrf-result').textContent = sameOrigin && validToken ?
    'Modelo: operação aceita. Na aplicação real, o servidor também valida sessão e autorização.' :
    'Modelo: operação recusada por origem não confiável ou token inválido.';
});
const KEY = 'pw08:seguranca:preferencia';
const COOKIE = 'pw08_seguranca';
const path = location.pathname.slice(0, location.pathname.lastIndexOf('/') + 1);
function readCookie() {
  return document.cookie.split('; ').find((item) => item.startsWith(COOKIE + '='))?.slice(COOKIE.length + 1) ?? null;
}
function writeCookie(value, age = 3600) {
  document.cookie = `${COOKIE}=${value}; Max-Age=${age}; Path=${path}; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
  if (age > 0 && readCookie() !== value) throw new Error('O navegador bloqueou o cookie.');
}
function showCookies() {
  const state = { cookie: readCookie(), copiaLocal: localStorage.getItem(KEY) };
  document.getElementById('cookie-state').textContent = JSON.stringify(state, null, 2);
}
function action(id, callback) {
  document.getElementById(id).addEventListener('click', () => {
    try { callback(); showCookies(); document.getElementById('status').textContent = 'Operação local concluída.'; }
    catch (error) { document.getElementById('status').textContent = 'Não foi possível acessar os dados: ' + error.message; }
  });
}
action('seed-cookie', () => { localStorage.setItem(KEY, 'modo-aula'); writeCookie('modo-aula'); });
action('delete-cookie', () => writeCookie('', 0));
action('restore-cookie', () => { if (localStorage.getItem(KEY) === 'modo-aula') writeCookie('modo-aula'); });
action('clear-cookie', () => { writeCookie('', 0); localStorage.removeItem(KEY); });
try { showCookies(); } catch (error) { document.getElementById('status').textContent = 'Armazenamento indisponível: ' + error.message; }
