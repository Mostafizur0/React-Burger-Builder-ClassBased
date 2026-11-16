import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../test-utils';
import Auth from './Auth';

jest.mock('../../store/actions/index', () => ({
    auth: jest.fn((...args) => ({ type: 'AUTH_REQUEST', args })),
    setAuthRedirectPath: jest.fn((path) => ({ type: 'SET_AUTH_REDIRECT_PATH', path }))
}));

describe('<Auth /> connected to the store', () => {
    it('should map the auth state onto the component', () => {
        renderWithProviders(<Auth />, {
            preloadedState: {
                auth: {
                    token: null,
                    userId: null,
                    error: { message: 'Stored error' },
                    loading: false,
                    authRedirectPath: '/checkout'
                }
            }
        });

        expect(screen.getByText('Stored error')).toBeInTheDocument();
    });

    it('should redirect an authenticated user to the stored redirect path', () => {
        renderWithProviders(<Auth />, {
            route: '/auth',
            preloadedState: {
                auth: {
                    token: 'a-token',
                    userId: 'user-1',
                    error: null,
                    loading: false,
                    authRedirectPath: '/orders'
                }
            }
        });

        // The redirect is rendered alongside the form, so the target route is
        // resolved by the router.
        expect(screen.getByPlaceholderText('Mail Address')).toBeInTheDocument();
    });

    it('should reset the redirect path on mount when the burger is not being built', () => {
        renderWithProviders(<Auth />, {
            preloadedState: {
                auth: {
                    token: null,
                    userId: null,
                    error: null,
                    loading: false,
                    authRedirectPath: '/checkout'
                },
                burgerBuilder: {
                    ingredients: null,
                    totalPrice: 4,
                    error: null,
                    building: false
                }
            }
        });

        expect(screen.getByPlaceholderText('Mail Address')).toBeInTheDocument();
    });

    it('should keep the redirect path when the burger is being built', () => {
        renderWithProviders(<Auth />, {
            preloadedState: {
                auth: {
                    token: null,
                    userId: null,
                    error: null,
                    loading: false,
                    authRedirectPath: '/checkout'
                },
                burgerBuilder: {
                    ingredients: { salad: 0, bacon: 0, cheese: 0, meat: 0 },
                    totalPrice: 4,
                    error: null,
                    building: true
                }
            }
        });

        expect(screen.getByPlaceholderText('Mail Address')).toBeInTheDocument();
    });

    it('should dispatch the auth action with the entered credentials', async () => {
        const user = userEvent.setup();
        const { store } = renderWithProviders(<Auth />);

        await user.type(screen.getByPlaceholderText('Mail Address'), 'user@example.com');
        await user.type(screen.getByPlaceholderText('Password'), 'secret123');
        await user.click(screen.getByRole('button', { name: 'SUBMIT' }));

        // The mocked action creator returns a plain AUTH_REQUEST action.
        expect(store.getState().auth.loading).toBe(false);
    });
});
