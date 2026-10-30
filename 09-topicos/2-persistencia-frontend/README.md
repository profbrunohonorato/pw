# 2 — Persistência de dados no front-end

O banco de dados do navegador é o **IndexedDB**. Ele integra as Web APIs: não exige instalar um banco ou uma biblioteca. Esta aula implementa salvar, ler e apagar uma nota usando quatro mecanismos reais. Execute por HTTP local conforme o [guia geral](../README.md).

## Comparação

| Mecanismo | Organização | Vida útil típica | Observações |
| --- | --- | --- | --- |
| sessionStorage | Strings por chave | Sessão da aba; recarregamento preserva | Separado por origem e contexto de aba; uma aba aberta por outra pode receber uma cópia inicial |
| localStorage | Strings por chave | Entre sessões, até remoção ou políticas do navegador | Acesso síncrono; compartilhado por abas da mesma origem |
| Cookies | Pares nome/valor com atributos | Sessão ou prazo definido | Pequenos; enviados nas requisições compatíveis com domínio, caminho, SameSite e Secure |
| IndexedDB | Objetos, object stores, índices e transações | Entre sessões, até remoção ou políticas do navegador | Assíncrono; permite dados estruturados e volumes maiores, sujeitos a cotas |

Origem combina protocolo, host e porta. Trocar `http://localhost:8000` por `http://127.0.0.1:8000` não preserva a mesma origem. Pastas não isolam localStorage e IndexedDB; prefixos e nomes distintos evitam colisões acidentais, mas não criam uma fronteira de segurança. Scripts da mesma origem podem acessar esses dados conforme as APIs disponíveis. Cookies usam regras próprias de domínio e caminho e não são isolados por porta.

Não existe uma cota universal igual em todos os navegadores. Espaço disponível, políticas de privacidade, modo privado e limpeza do usuário afetam a persistência. Dados locais não são um backup: podem ser apagados. Consulte [Web Storage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API), [cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies), [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) e [cotas e remoção](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria).

## O que foi implementado

O campo da nota alimenta quatro cartões. Salvar grava o campo; Ler consulta o mecanismo e copia o valor para o campo; Apagar remove apenas a nota daquele mecanismo. Não há sincronização automática entre as cópias.

- Web Storage usa `pw08:persistencia:nota` e `setItem`, `getItem`, `removeItem`.
- O cookie `pw08_nota` dura sete dias, tem `SameSite=Lax`, caminho desta pasta e `Secure` quando servido por HTTPS. O limite didático é 500 caracteres após codificação, menor que o limite usual de um cookie. O exemplo usa `encodeURIComponent` e verifica se a gravação foi aceita.
- IndexedDB usa o banco `pw08-persistencia`, versão 1, object store `notas` e chave `aula`. Cada objeto registra `id`, `texto` e `atualizadoEm`.
- As operações do banco só são consideradas concluídas no evento `transaction.oncomplete`. Há tratamento de erro, aborto e mudança de versão.
- “Apagar os dados desta aula” remove somente as chaves e o registro usados aqui. Não executa `localStorage.clear()`, não limpa cookies de outras aulas e não apaga bancos alheios.

## Roteiro de experiência

1. Salve textos diferentes nos quatro mecanismos. Use Ler para verificar que cada cópia é independente.
2. Recarregue a página: todos devem conservar as notas quando o navegador permite armazenamento.
3. Abra a URL manualmente em outra aba. Compare a nota de sessionStorage com as dos demais mecanismos. Não confunda uma aba duplicada com uma aba nova: ela pode receber estado inicial copiado.
4. Feche a aba e abra outra pela barra de endereços. Em uma sessão nova, sessionStorage normalmente não terá a nota anterior; restauração de abas/sessões pode restaurar esse estado, portanto não é um mecanismo de expiração de segurança.
5. Abra Application/Storage no DevTools. Observe o cookie, as chaves e o objeto no IndexedDB. Alguns painéis precisam de atualização manual.
6. Apague uma cópia e confira as demais. Depois use o botão de limpeza da aula.
7. Repita com armazenamento bloqueado para observar a mensagem de falha. Um cookie de sessão também pode sobreviver à restauração de sessão do navegador.

## Tutorial: armazenar objetos no Web Storage

Web Storage aceita strings. Serialize objetos e valide o conteúdo ao ler:

```js
const chave = 'minha-aula:preferencias';
try {
  localStorage.setItem(chave, JSON.stringify({ tema: 'claro', versao: 1 }));
  const texto = localStorage.getItem(chave);
  const preferencias = texto === null ? null : JSON.parse(texto);
  if (preferencias && preferencias.versao !== 1) {
    throw new Error('Versão de dados desconhecida.');
  }
} catch (erro) {
  console.error('Dados inválidos ou armazenamento indisponível.', erro);
}
```

Para sincronizar interfaces entre abas, escute `storage`. O evento de localStorage ocorre em outros documentos da mesma origem, não no documento que efetuou a alteração. Para consultas maiores e objetos estruturados, prefira IndexedDB a grandes JSONs síncronos. Fonte: [evento storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event).

## Tutorial: evoluir o esquema do IndexedDB

1. Defina os object stores e as chaves antes de gravar dados. No exemplo, `notas` usa `id` como chave.
2. Para adicionar um índice, aumente a versão do banco e execute a migração em `onupgradeneeded`.
3. Se a store já existe, obtenha-a pela transação de atualização e crie apenas índices ainda ausentes.
4. Feche conexões antigas em `onversionchange`; outras abas podem bloquear a migração. Trate `onblocked` com orientação ao usuário.
5. Faça consultas em transações `readonly` e alterações em `readwrite`. Não espere uma chamada de rede no meio de uma transação: ela pode ficar inativa antes de você voltar a usá-la.
6. Mantenha validação e estratégia de exportação/sincronização para dados importantes. O exemplo não implementa backup ou contas.

Trecho ilustrativo de uma futura migração para versão 2; ele deve substituir o fluxo de abertura, não rodar em paralelo com o esquema antigo:

```js
const pedido = indexedDB.open('pw08-persistencia', 2);
pedido.onupgradeneeded = () => {
  const db = pedido.result;
  const store = db.objectStoreNames.contains('notas')
    ? pedido.transaction.objectStore('notas')
    : db.createObjectStore('notas', { keyPath: 'id' });
  if (!store.indexNames.contains('porAtualizacao')) {
    store.createIndex('porAtualizacao', 'atualizadoEm');
  }
};
```

## Tutorial: cookie de autenticação definido no servidor

O cookie da aplicação é uma preferência de demonstração acessível ao JavaScript. Uma sessão real deve ser projetada no back-end. Um exemplo de resposta HTTPS é:

```http
Set-Cookie: __Host-session=VALOR_ALEATORIO_DO_SERVIDOR; Path=/; HttpOnly; Secure; SameSite=Lax
```

`HttpOnly` impede leitura do cookie por JavaScript; não impede que XSS faça operações autenticadas em nome do usuário. `Secure` limita envio a conexões seguras; `SameSite` restringe envio em contextos entre sites. O prefixo `__Host-` exige `Secure`, `Path=/` e ausência de `Domain` em navegadores que o aplicam. O servidor precisa gerar e invalidar a sessão, verificar autorização e proteger operações contra CSRF. Não coloque senhas ou segredos no HTML ou em localStorage. Fonte: [guia de cookies da MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies).

## Exercícios

- Modele uma lista de tarefas com vários registros no IndexedDB, incluindo edição e exclusão por chave.
- Compare preferência de tema, rascunho da aba e catálogo offline: qual armazenamento escolher para cada caso?
- Explique por que apagar um cookie não apaga automaticamente sua cópia em localStorage. Continue no laboratório 3.
