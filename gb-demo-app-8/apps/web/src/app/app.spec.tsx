import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './app';

describe('App', () => {
  it('renders navigation and the home page', () => {
    render(<App />, { wrapper: MemoryRouter });

    expect(screen.getByRole('heading', { name: 'Главная страница' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Новости' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Добавить новость' })).toBeTruthy();
  });
});
