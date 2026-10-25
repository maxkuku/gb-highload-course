import { getHeading } from '../support/app.po';

describe('web', () => {
  beforeEach(() => cy.visit('/'));

  it('should display the home page and navigation', () => {
    getHeading().contains('Главная страница');
    cy.contains('Новости').should('have.attr', 'href', '/news');
    cy.contains('Добавить новость').should('have.attr', 'href', '/create');
  });
});
