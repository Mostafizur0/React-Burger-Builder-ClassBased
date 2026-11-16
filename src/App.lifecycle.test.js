import React from 'react';
import { screen } from '@testing-library/react';

import { renderWithProviders } from './test-utils';
import { App } from './App';

jest.mock('firebase/auth', () => ({
    createUserWithEmailAndPassword: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(() => jest.fn())
}));

jest.mock('firebase/database', () => ({
    get: jest.fn(() => Promise.resolve({ val: () => null })),
    push: jest.fn(),
    ref: jest.fn(() => ({ path: 'ingredients' })),
    query: jest.fn(() => ({ path: 'orders' })),
    orderByChild: jest.fn(() => 'orderByChild'),
    equalTo: jest.fn(() => 'equalTo')
}));

describe('<App /> lifecycle', () => {
    it('should detach the auth listener on unmount', () => {
        const unsubscribe = jest.fn();
        const onTryAutoSignup = jest.fn(() => unsubscribe);
        const { unmount } = renderWithProviders(<App onTryAutoSignup={onTryAutoSignup} />);

        expect(onTryAutoSignup).toHaveBeenCalledTimes(1);

        unmount();

        expect(unsubscribe).toHaveBeenCalledTimes(1);
    });

    it('should tolerate an auth listener that returns nothing', () => {
        const onTryAutoSignup = jest.fn(() => undefined);
        const { unmount } = renderWithProviders(<App onTryAutoSignup={onTryAutoSignup} />);

        expect(() => unmount()).not.toThrow();
    });

    it('should render the builder once mounted', async () => {
        renderWithProviders(<App onTryAutoSignup={jest.fn(() => jest.fn())} />);

        expect(await screen.findByText(/Current Price:/)).toBeInTheDocument();
    });
});
