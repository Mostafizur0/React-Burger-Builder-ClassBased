import React from 'react';

import { renderWithProviders } from '../../../test-utils';
import Logout from './Logout';

jest.mock('../../../store/actions/index', () => ({
    signOutUser: jest.fn(() => ({ type: 'AUTH_LOGOUT' }))
}));

describe('<Logout /> connected to the store', () => {
    it('should dispatch the sign out action on mount', () => {
        const { store } = renderWithProviders(<Logout />, {
            preloadedState: {
                auth: {
                    token: 'a-token',
                    userId: 'user-1',
                    error: null,
                    loading: false,
                    authRedirectPath: '/'
                }
            }
        });

        // The mapped dispatch handler clears the session in the store.
        expect(store.getState().auth.token).toBeNull();
    });
});
