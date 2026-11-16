import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DrawerToggle from './DrawerToggle';

describe('<DrawerToggle />', () => {
    it('should render three bars', () => {
        render(<DrawerToggle clicked={jest.fn()} />);

        expect(screen.getAllByTestId('drawer-bar')).toHaveLength(3);
    });

    it('should call the click handler', async () => {
        const user = userEvent.setup();
        const clicked = jest.fn();
        render(<DrawerToggle clicked={clicked} />);

        await user.click(screen.getByTestId('drawer-toggle'));

        expect(clicked).toHaveBeenCalled();
    });
});
