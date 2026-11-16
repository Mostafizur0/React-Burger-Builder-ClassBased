import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import SideDrawer from './SideDrawer';

const renderDrawer = (props) =>
    render(
        <MemoryRouter>
            <SideDrawer {...props} />
        </MemoryRouter>
    );

describe('<SideDrawer />', () => {
    it('should be closed by default', () => {
        renderDrawer({ isAuth: false, open: false, closed: jest.fn() });

        expect(screen.getByTestId('side-drawer')).toHaveClass('Close');
    });

    it('should be open when the open prop is set', () => {
        renderDrawer({ isAuth: false, open: true, closed: jest.fn() });

        expect(screen.getByTestId('side-drawer')).toHaveClass('Open');
    });

    it('should call closed when the drawer is clicked', async () => {
        const user = userEvent.setup();
        const closed = jest.fn();
        renderDrawer({ isAuth: false, open: true, closed });

        await user.click(screen.getByTestId('side-drawer'));

        expect(closed).toHaveBeenCalled();
    });

    it('should render the navigation items', () => {
        renderDrawer({ isAuth: true, open: false, closed: jest.fn() });

        expect(screen.getByRole('link', { name: 'Orders' })).toBeInTheDocument();
    });
});
