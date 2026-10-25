import { render, screen, waitFor } from '@testing-library/react';
import News from './news';

describe('News', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    global.fetch = fetchMock as unknown as typeof fetch;
  });
  afterEach(() => fetchMock.mockReset());

  it('loads and renders news from the API', async () => {
    const items = [
      { id: 1, title: 'Первая', description: 'Текст', createdAt: 1 },
    ];
    fetchMock.mockResolvedValue({
      json: async () => items,
    } as Response);

    render(<News />);

    await waitFor(() => expect(screen.getByText('Первая')).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/news');
  });
});
