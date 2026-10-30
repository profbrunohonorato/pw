import addresses from '../_assets/data/endereco.json';

export function normalize(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
}

export function suggestAddresses(value) {
  const query = normalize(value.trim());
  return query.length < 2 ? [] : addresses.logradouros.filter((name) => normalize(name).includes(query)).slice(0, 20);
}
