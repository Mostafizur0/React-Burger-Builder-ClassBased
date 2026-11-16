import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import NavigationItem from './NavigationItem';

const renderItem = (props) =>
    render(
        <MemoryRouter>
            <NavigationItem {...props} />
        </MemoryRouter>
    );

describe('<NavigationItem />', () => {
    it('should render a link to the given path', () => {
        renderItem({ link: '/orders', children: 'Orders' });

        expect(screen.getByRole('link', { name: 'Orders' })).toHaveAttribute('href', '/orders');
    });

    it('should render the children', () => {
        renderItem({ link: '/orders', children: 'Orders' });

        expect(screen.getByText('Orders')).toBeInTheDocument();
    });
});
