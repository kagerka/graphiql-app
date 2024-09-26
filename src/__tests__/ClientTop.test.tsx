import { ClientTop } from '@/components/ClientTop/ClientTop';
import { render, screen, fireEvent } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { usePathname } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';
import { renderWithIntl } from '../utils/testUtils';

const ROUTES = {
  GRAPHQL: '/en/graphiql',
  RESTAPI: '/en/restapi',
  HISTORY: '/en/history',
};

describe('ClientTop', () => {
  it('should render correctly for graphql', () => {
    (usePathname as jest.Mock).mockReturnValueOnce(ROUTES.GRAPHQL);

    const setGraphqlDocsIsOpen = vi.fn();

    renderWithIntl(
      <ClientTop
        title='GraphiQL Client'
        setGraphqlDocsIsOpen={setGraphqlDocsIsOpen}
        graphqlDocsIsOpen={false}
        isDocsAvailable
      />,
    );

    expect(screen.getByText(/GraphiQL Client/i)).toBeDefined();

    const historyBtn = screen.getByTestId('historyBtn');
    expect(historyBtn).toBeDefined();

    const restBtn = screen.getByTestId('restapiBtn');
    expect(restBtn).toBeDefined();

    const link = historyBtn.getAttribute('href');
    expect(link).toBe(ROUTES.HISTORY);
  });

  it('should render correctly for rest api', () => {
    (usePathname as jest.Mock).mockReturnValueOnce(ROUTES.RESTAPI);

    renderWithIntl(<ClientTop title='RestAPI Client' />);

    expect(screen.getByText(/RestAPI Client/i)).toBeDefined();

    const historyBtn = screen.getByTestId('historyBtn');
    expect(historyBtn).toBeDefined();

    const restBtn = screen.getByTestId('graphqlBtn');
    expect(restBtn).toBeDefined();
  });

  it('should render Docs button correctly', () => {
    (usePathname as jest.Mock).mockReturnValue(ROUTES.GRAPHQL);

    renderWithIntl(<ClientTop title='GraphiQL Client' isDocsAvailable />);

    const docsBtn = screen.queryByText(/Docs/i);
    expect(docsBtn).toBeDefined();
  });

  it("shouldn't render Docs button", () => {
    (usePathname as jest.Mock).mockReturnValue(ROUTES.GRAPHQL);

    renderWithIntl(<ClientTop title='GraphiQL Client' isDocsAvailable={false} />);

    const docsBtn = screen.queryByText(/Docs/i);
    expect(docsBtn).toBeNull();
  });

  it('should call setGraphqlDocsIsOpen', () => {
    const ONE = 1;
    (usePathname as jest.Mock).mockReturnValue(ROUTES.GRAPHQL);

    const setGraphqlDocsIsOpen = vi.fn();
    const graphqlDocsIsOpen = false;

    renderWithIntl(
      <ClientTop
        title='GraphiQL Client'
        setGraphqlDocsIsOpen={setGraphqlDocsIsOpen}
        graphqlDocsIsOpen={graphqlDocsIsOpen}
        isDocsAvailable
      />,
    );

    const docsBtn = screen.getByTestId('docsBtn');

    fireEvent.click(docsBtn);
    expect(setGraphqlDocsIsOpen).toBeCalledTimes(ONE);
    expect(setGraphqlDocsIsOpen).toBeCalledWith(true);
  });

  it('docs button should contain "docs_open" className', () => {
    (usePathname as jest.Mock).mockReturnValue(ROUTES.GRAPHQL);

    const setGraphqlDocsIsOpen = vi.fn();
    const graphqlDocsIsOpen = true;

    renderWithIntl(
      <ClientTop
        title='GraphiQL Client'
        setGraphqlDocsIsOpen={setGraphqlDocsIsOpen}
        graphqlDocsIsOpen={graphqlDocsIsOpen}
        isDocsAvailable
      />,
    );

    const docsBtn = screen.getByTestId('docsBtn');

    expect(docsBtn.className.includes('docs_open')).toBe(true);
  });
});
