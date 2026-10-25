import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CreateNews from './create-news';

describe('CreateNews', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    global.fetch = fetchMock as unknown as typeof fetch;
  });
  afterEach(() => {
    fetchMock.mockReset();
    jest.restoreAllMocks();
  });

  it('submits a new item and clears the form', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1 }),
    } as Response);
    jest.spyOn(window, 'alert').mockImplementation(() => undefined);
    render(<CreateNews />);

    fireEvent.change(screen.getByRole('textbox', { name: 'Заголовок' }), {
      target: { name: 'title', value: 'Новая' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Текст' }), {
      target: { name: 'description', value: 'Описание' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Добавить' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/news',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ title: 'Новая', description: 'Описание' }),
      })
    );
    await waitFor(() => {
      expect((screen.getByRole('textbox', { name: 'Заголовок' }) as HTMLInputElement).value).toBe('');
    });
  });
});
