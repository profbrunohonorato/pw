'use strict';
const dialog = document.getElementById('demo-dialog');
document.getElementById('open-dialog').addEventListener('click', () => {
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else document.getElementById('native-status').textContent = 'Este navegador não oferece dialog.showModal().';
});
if (!('popover' in HTMLElement.prototype)) {
  document.getElementById('open-popover').disabled = true;
  document.getElementById('native-status').textContent = 'Popover indisponível neste navegador. O restante da aula continua acessível.';
}
if ('customElements' in window && 'attachShadow' in Element.prototype) {
  class AulaCounter extends HTMLElement {
    constructor() {
      super();
      this.count = 0;
      const shadow = this.attachShadow({ mode: 'open' });
      shadow.append(document.getElementById('counter-template').content.cloneNode(true));
      shadow.querySelector('button').addEventListener('click', () => {
        this.count += 1;
        shadow.querySelector('output').textContent = `${this.count} ${this.count === 1 ? 'interação' : 'interações'}`;
      });
    }
  }
  if (!customElements.get('aula-counter')) customElements.define('aula-counter', AulaCounter);
} else document.getElementById('component-status').textContent = 'Web Components indisponíveis neste navegador.';
const offlineStatus = document.getElementById('offline-status');
const expectedScope = new URL('./', location.href).href;
const offlineCache = 'pw08-tendencias-v1';
function canUseOffline() {
  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    offlineStatus.textContent = 'Use um navegador compatível em HTTPS ou localhost para ativar o modo offline.';
    return false;
  }
  return true;
}
async function withOfflineBusy(action) {
  const buttons = ['enable-offline', 'disable-offline'].map((id) => document.getElementById(id));
  buttons.forEach((button) => { button.disabled = true; });
  try { await action(); }
  catch (error) { offlineStatus.textContent = 'Não foi possível concluir: ' + error.message; }
  finally { buttons.forEach((button) => { button.disabled = false; }); }
}
document.getElementById('enable-offline').addEventListener('click', () => withOfflineBusy(async () => {
  if (!canUseOffline()) return;
  const registration = await navigator.serviceWorker.register('./sw.js', { scope: './' });
  offlineStatus.textContent = 'Registrado. Aguarde a instalação e recarregue; confira o estado no DevTools.';
  const worker = registration.installing || registration.waiting || registration.active;
  if (worker && worker.state !== 'activated') worker.addEventListener('statechange', () => {
    if (worker.state === 'activated') offlineStatus.textContent = 'Cache instalado. Recarregue esta página antes de testar offline.';
    if (worker.state === 'redundant') offlineStatus.textContent = 'A instalação falhou ou foi substituída. Confira a rede e o DevTools.';
  });
  else offlineStatus.textContent = 'Service worker ativo. Recarregue esta página antes de testar offline.';
}));
document.getElementById('disable-offline').addEventListener('click', () => withOfflineBusy(async () => {
  if (!canUseOffline()) return;
  for (const registration of await navigator.serviceWorker.getRegistrations()) {
    if (registration.scope === expectedScope) await registration.unregister();
  }
  await caches.delete(offlineCache);
  offlineStatus.textContent = 'Registro e cache desta aula removidos. Feche as abas desta pasta para encerrar o worker ainda em uso.';
}));
