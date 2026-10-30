'use strict';
const title = document.getElementById('titulo');
function updateSlug() {
  const slug = title.value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  document.getElementById('slug').textContent = slug || '(informe um título com letras ou números)';
  document.getElementById('url').textContent = slug ? 'https://example.com/artigos/' + slug : '';
}
document.getElementById('slug-form').addEventListener('submit', (event) => { event.preventDefault(); updateSlug(); });
updateSlug();
