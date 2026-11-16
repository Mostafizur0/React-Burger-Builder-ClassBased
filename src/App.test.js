import React from 'react';
import { screen } from '@testing-library/react';

import { renderWithProviders } from './test-utils';
import App from './App';

// The Firebase SDK is replaced so no test touches the network. The auth state
// listener never fires, which leaves the store's session untouched.
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

// The Realtime Database module is replaced with a stub so the ingredient
// request resolves without touching the network.
jest.mock('firebase/database', () => ({
    get: jest.fn(() => Promise.resolve({ val: () => null })),
    push: jest.fn(),
    ref: jest.fn(() => ({ path: 'ingredients' })),
    query: jest.fn(() => ({ path: 'orders' })),
    orderByChild: jest.fn(() => 'orderByChild'),
    equalTo: jest.fn(() => 'equalTo')
}));

describe('<App />', () => {
    it('should render the burger builder for anonymous visitors', async () => {
        renderWithProviders(<App />);

        expect(await screen.findByText(/Current Price:/)).toBeInTheDocument();
        expect(screen.getAllByRole('link', { name: 'Authenticate' })).toHaveLength(2);
    });

    it('should render the orders and logout links when authenticated', async () => {
        renderWithProviders(<App />, {
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

        expect(await screen.findAllByRole('link', { name: 'Orders' })).toHaveLength(2);
        expect(screen.getAllByRole('link', { name: 'Logout' })).toHaveLength(2);
    });
});
