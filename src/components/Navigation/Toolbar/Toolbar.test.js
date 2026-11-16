import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Toolbar from './Toolbar';

const renderToolbar = (props) =>
    render(
        <MemoryRouter>
            <Toolbar {...props} />
        </MemoryRouter>
    );

describe('<Toolbar />', () => {
    it('should render the navigation items', () => {
        renderToolbar({ isAuth: false, drawerToggleClicked: jest.fn() });

        expect(screen.getByRole('link', { name: 'Burger Builder' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Authenticate' })).toBeInTheDocument();
    });

    it('should render the orders link when authenticated', () => {
        renderToolbar({ isAuth: true, drawerToggleClicked: jest.fn() });

        expect(screen.getByRole('link', { name: 'Orders' })).toBeInTheDocument();
    });

    it('should render the logo', () => {
        renderToolbar({ isAuth: false, drawerToggleClicked: jest.fn() });

        expect(screen.getByTestId('logo')).toBeInTheDocument();
    });
});
