import React from 'react';
import { screen } from '@testing-library/react';

import { renderWithProviders } from './test-utils';
import App from './App';

jest.mock('firebase/auth', () => ({
    createUserWithEmailAndPassword: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(() => jest.fn())
}));

jest.mock('./services/firebase', () => ({
    auth: { name: 'auth' },
    database: { name: 'database' },
    isFirebaseConfigured: true
}));

jest.mock('firebase/database', () => ({
    get: jest.fn(() => Promise.resolve({ val: () => null })),
    push: jest.fn(),
    ref: jest.fn(() => ({ path: 'ingredients' })),
    query: jest.fn(() => ({ path: 'orders' })),
    orderByChild: jest.fn(() => 'orderByChild'),
    equalTo: jest.fn(() => 'equalTo')
}));

const authenticatedState = {
    auth: {
        token: 'a-token',
        userId: 'user-1',
        error: null,
        loading: false,
        authRedirectPath: '/'
    }
};

describe('<App /> lazy routes', () => {
    it('should load the auth route', async () => {
        renderWithProviders(<App />, { route: '/auth' });

        expect(await screen.findByPlaceholderText('Mail Address')).toBeInTheDocument();
    });

    it('should load the orders route', async () => {
        renderWithProviders(<App />, {
            route: '/orders',
            preloadedState: authenticatedState
        });

        // The lazy chunk resolves and the order request finishes.
        expect(await screen.findAllByRole('link', { name: 'Orders' })).toHaveLength(2);
    });

    it('should load the checkout route', async () => {
        renderWithProviders(<App />, {
            route: '/checkout',
            preloadedState: {
                ...authenticatedState,
                burgerBuilder: {
                    ingredients: { salad: 0, bacon: 0, cheese: 1, meat: 1 },
                    totalPrice: 5.7,
                    error: null,
                    building: true
                }
            }
        });

        expect(await screen.findByText('We hope it tastes well!')).toBeInTheDocument();
    });
});
