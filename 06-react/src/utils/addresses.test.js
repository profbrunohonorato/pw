import { describe, expect, it } from 'vitest';
import { suggestAddresses } from './addresses';
import { insideMunicipality } from './municipality';

describe('Dados locais de Dois Vizinhos', () => {
  it('sugere ruas ignorando acentos e caixa e exige duas letras', () => {
    expect(suggestAddresses('MEXICO')).toContain('Avenida México');
    expect(suggestAddresses('m')).toEqual([]);
    expect(suggestAddresses('rua').length).toBeLessThanOrEqual(20);
  });
  it('aceita Dois Vizinhos e recusa Curitiba e coordenadas inválidas', () => {
    expect(insideMunicipality([-53.0577, -25.7469])).toBe(true);
    expect(insideMunicipality([-49.27, -25.43])).toBe(false);
    expect(insideMunicipality([NaN, -25.74])).toBe(false);
    expect(insideMunicipality(null)).toBe(false);
  });
});
