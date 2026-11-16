import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../test-utils';
import Layout from './Layout';

describe('<Layout />', () => {
    it('should render the toolbar and the children', () => {
        renderWithProviders(<Layout><span>Page content</span></Layout>);

        // The navigation is rendered twice: once in the toolbar and once in the
        // side drawer.
        expect(screen.getAllByRole('link', { name: 'Burger Builder' })).toHaveLength(2);
        expect(screen.getByText('Page content')).toBeInTheDocument();
    });

    it('should open the side drawer when the toggle is clicked', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Layout><span>Page content</span></Layout>);

        await user.click(screen.getByTestId('drawer-toggle'));

        expect(screen.getByTestId('side-drawer')).toHaveClass('Open');
    });

    it('should close the side drawer when it is clicked', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Layout><span>Page content</span></Layout>);

        await user.click(screen.getByTestId('drawer-toggle'));
        await user.click(screen.getByTestId('side-drawer'));

        expect(screen.getByTestId('side-drawer')).toHaveClass('Close');
    });

    it('should show the orders link when authenticated', () => {
        renderWithProviders(
            <Layout><span>Page content</span></Layout>,
            {
                preloadedState: {
                    auth: {
                        token: 'a-token',
                        userId: 'user-1',
                        error: null,
                        loading: false,
                        authRedirectPath: '/'
                    }
                }
            }
        );

        expect(screen.getAllByRole('link', { name: 'Orders' })).toHaveLength(2);
    });
});
