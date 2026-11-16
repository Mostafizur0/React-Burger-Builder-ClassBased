import React from 'react';

// The entry point mounts the application into #root. The DOM renderer is
// replaced so the module can be exercised without a real root element.
const mockRender = jest.fn();
jest.mock('react-dom/client', () => ({
    createRoot: jest.fn(() => ({ render: mockRender }))
}));

jest.mock('firebase/auth', () => ({
    createUserWithEmailAndPassword: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(() => jest.fn())
}));

describe('application entry point', () => {
    beforeEach(() => {
        mockRender.mockClear();
        document.body.innerHTML = '<div id="root"></div>';
        jest.resetModules();
    });

    it('should mount the application into the root element', () => {
        const { createRoot } = require('react-dom/client');

        require('./index');

        expect(createRoot).toHaveBeenCalledWith(document.getElementById('root'));
        expect(mockRender).toHaveBeenCalledTimes(1);
        expect(React.isValidElement(mockRender.mock.calls[0][0])).toBe(true);
    });

    it('should compose the store with the redux devtools extension when present', () => {
        // The extension's compose function receives the store enhancers and
        // must return a valid enhancer.
        const compose = jest.fn((...enhancers) => enhancers[0]);
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ = compose;

        require('./index');

        expect(compose).toHaveBeenCalled();
        delete window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
    });
});
