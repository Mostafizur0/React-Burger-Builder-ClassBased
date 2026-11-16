import React from 'react';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '../../../test-utils';
import NavigationItems from './NavigationItems';

describe('<NavigationItems />', () => {
    it('should render two navigation items if not authenticated', () => {
        renderWithProviders(<NavigationItems isAuthenticated={false} />);

        expect(screen.getByRole('link', { name: 'Burger Builder' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Authenticate' })).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Orders' })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Logout' })).not.toBeInTheDocument();
    });

    it('should render three navigation items if authenticated', () => {
        renderWithProviders(<NavigationItems isAuthenticated={true} />);

        expect(screen.getByRole('link', { name: 'Burger Builder' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Orders' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Logout' })).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Authenticate' })).not.toBeInTheDocument();
    });
});
