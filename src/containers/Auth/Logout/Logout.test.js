import React from 'react';

import { renderWithProviders } from '../../../test-utils';
import { Logout } from './Logout';

describe('<Logout />', () => {
    it('should call onLogout on mount', () => {
        const onLogout = jest.fn();
        renderWithProviders(<Logout onLogout={onLogout} />);

        expect(onLogout).toHaveBeenCalledTimes(1);
    });

    it('should redirect to the home page', () => {
        const { container } = renderWithProviders(<Logout onLogout={jest.fn()} />, { route: '/logout' });

        // The component renders a <Redirect to="/" /> and nothing else.
        expect(container.innerHTML).toBe('');
    });
});
