import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { forwardRef, useImperativeHandle } from 'react';
import RoutePlanner from './RoutePlanner';
import { calculateRoute, searchAddresses } from '../../utils/api';

vi.mock('../../utils/api', () => ({ searchAddresses: vi.fn(), calculateRoute: vi.fn() }));
vi.mock('../MapWrapper', () => ({ default: forwardRef(function TestMap({ picking, onPick }, ref) {
  useImperativeHandle(ref, () => ({ center() {}, focus() {} }));
  return <><button onClick={() => onPick(picking, [-53.06, -25.75])}>Ponto local</button>
    <button onClick={() => onPick(picking, [-49.27, -25.43])}>Ponto externo</button></>;
}) }));

beforeEach(() => { vi.clearAllMocks(); });
describe('Fluxo da calculadora', () => {
  it('usa sugestões locais, exige seleção, calcula e invalida a rota ao editar', async () => {
    searchAddresses.mockResolvedValue([{ coordinates: [-53.0577, -25.7469], name: 'Avenida México em Dois Vizinhos' }]);
    calculateRoute.mockResolvedValue({ distance: 1500, duration: 90 });
    render(<RoutePlanner />);
    const origin = screen.getByLabelText('A · Origem');
    const calculate = screen.getByRole('button', { name: 'Calcular rota de carro' });
    fireEvent.change(origin, { target: { value: 'mexico' } });
    expect(document.querySelector('#origin-suggestions option').value).toBe('Avenida México');
    expect(searchAddresses).not.toHaveBeenCalled();
    expect(calculate).toBeDisabled();
    fireEvent.submit(origin.closest('form'));
    fireEvent.click(await screen.findByRole('button', { name: 'Avenida México em Dois Vizinhos' }));
    fireEvent.click(screen.getByRole('button', { name: 'Marcar destino no mapa' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ponto externo' }));
    expect(screen.getByRole('status')).toHaveTextContent('dentro de Dois Vizinhos');
    expect(calculate).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Marcar destino no mapa' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ponto local' }));
    fireEvent.click(calculate);
    expect(await screen.findByText('1,5 km')).toBeInTheDocument();
    expect(screen.getByText('2 min')).toBeInTheDocument();
    fireEvent.change(origin, { target: { value: 'Outra rua' } });
    expect(screen.queryByText('1,5 km')).not.toBeInTheDocument();
    expect(calculate).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Limpar' }));
    expect(origin).toHaveValue('');
    expect(screen.getAllByText('Nenhum ponto selecionado.')).toHaveLength(2);
  });
  it('informa busca sem resultado e libera o formulário após falha de rede', async () => {
    searchAddresses.mockResolvedValueOnce([]).mockRejectedValueOnce(new Error('Sem conexão'));
    render(<RoutePlanner />);
    const origin = screen.getByLabelText('A · Origem');
    fireEvent.change(origin, { target: { value: 'Rua ausente' } });
    fireEvent.submit(origin.closest('form'));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Nenhum endereço encontrado'));
    fireEvent.click(within(origin.closest('form')).getByRole('button', { name: 'Buscar' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Sem conexão'));
    expect(origin).toBeEnabled();
  });
});
