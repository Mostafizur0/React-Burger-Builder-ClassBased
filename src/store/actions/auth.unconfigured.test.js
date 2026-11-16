import * as actionTypes from './actionTypes';
import { auth, authCheckState, signOutUser } from './auth';
import { createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

// The service module is mocked as unconfigured for this file, so the
// "Firebase not available" branches of the thunks are exercised.
jest.mock('../../services/firebase', () => ({
    auth: null,
    isFirebaseConfigured: false
}));

jest.mock('firebase/auth', () => ({
    createUserWithEmailAndPassword: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn()
}));

describe('auth actions without a configured backend', () => {
    beforeEach(() => {
        createUserWithEmailAndPassword.mockReset();
        signOut.mockReset();
        onAuthStateChanged.mockReset();
    });

    it('should report that authentication is unavailable', () => {
        const dispatch = jest.fn();

        auth('user@example.com', 'password', true)(dispatch);

        expect(dispatch).toHaveBeenCalledWith({
            type: actionTypes.AUTH_FAIL,
            error: { message: 'Authentication is not configured for this deployment.' }
        });
        expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
    });

    it('should clear the session and return a no-op unsubscribe', () => {
        const dispatch = jest.fn();

        const unsubscribe = authCheckState()(dispatch);

        expect(dispatch).toHaveBeenCalledWith({ type: actionTypes.AUTH_LOGOUT });
        expect(typeof unsubscribe).toBe('function');
        expect(unsubscribe()).toBeUndefined();
        expect(onAuthStateChanged).not.toHaveBeenCalled();
    });

    it('should clear the session on sign out', async () => {
        const dispatch = jest.fn();

        await signOutUser()(dispatch);

        expect(dispatch).toHaveBeenCalledWith({ type: actionTypes.AUTH_LOGOUT });
        expect(signOut).not.toHaveBeenCalled();
    });
});
