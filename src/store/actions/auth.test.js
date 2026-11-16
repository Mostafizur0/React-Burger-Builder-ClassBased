import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';

import * as actionTypes from './actionTypes';
import {
    auth,
    authCheckState,
    signOutUser,
    setAuthRedirectPath,
    authStart,
    authSuccess,
    authFail,
    logout
} from './auth';

jest.mock('firebase/auth', () => ({
    createUserWithEmailAndPassword: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn()
}));

jest.mock('../../services/firebase', () => ({
    auth: { name: 'auth' },
    isFirebaseConfigured: true
}));

const mockUser = {
    uid: 'user-1',
    getIdToken: jest.fn(() => Promise.resolve('id-token'))
};

// The SDK resolves sign-in/sign-up with a UserCredential; the User that owns
// getIdToken() lives on its `user` property.
const mockCredential = (user = mockUser) => ({ user });

// Flushes the microtask queue so chained promise rejections are handled.
const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

describe('auth actions', () => {
    beforeEach(() => {
        createUserWithEmailAndPassword.mockReset();
        signInWithEmailAndPassword.mockReset();
        signOut.mockReset();
        onAuthStateChanged.mockReset();
        mockUser.getIdToken.mockClear();
    });

    describe('plain action creators', () => {
        it('should create the auth start action', () => {
            expect(authStart()).toEqual({ type: actionTypes.AUTH_START });
        });

        it('should create the auth success action', () => {
            expect(authSuccess('token', 'user-1')).toEqual({
                type: actionTypes.AUTH_SUCCESS,
                idToken: 'token',
                userId: 'user-1'
            });
        });

        it('should create the auth failure action', () => {
            const error = { message: 'nope' };
            expect(authFail(error)).toEqual({ type: actionTypes.AUTH_FAIL, error });
        });

        it('should create the logout action', () => {
            expect(logout()).toEqual({ type: actionTypes.AUTH_LOGOUT });
        });

        it('should create the redirect path action', () => {
            expect(setAuthRedirectPath('/checkout')).toEqual({
                type: actionTypes.SET_AUTH_REDIRECT_PATH,
                path: '/checkout'
            });
        });
    });

    describe('auth thunk', () => {
        it('should sign up a new user and store the token', async () => {
            createUserWithEmailAndPassword.mockResolvedValue(mockCredential());
            const dispatch = jest.fn();

            await auth('user@example.com', 'password', true)(dispatch);

            expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
                { name: 'auth' },
                'user@example.com',
                'password'
            );
            expect(dispatch).toHaveBeenCalledWith({ type: actionTypes.AUTH_START });
            expect(dispatch).toHaveBeenCalledWith({
                type: actionTypes.AUTH_SUCCESS,
                idToken: 'id-token',
                userId: 'user-1'
            });
        });

        it('should sign in an existing user', async () => {
            signInWithEmailAndPassword.mockResolvedValue(mockCredential());
            const dispatch = jest.fn();

            await auth('user@example.com', 'password', false)(dispatch);

            expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
                { name: 'auth' },
                'user@example.com',
                'password'
            );
            expect(dispatch).toHaveBeenCalledWith({
                type: actionTypes.AUTH_SUCCESS,
                idToken: 'id-token',
                userId: 'user-1'
            });
        });

        it('should read the token from the credential user, not the credential', async () => {
            // The SDK resolves with a UserCredential, which has no getIdToken of
            // its own; the User lives on its `user` property.
            const getIdToken = jest.fn(() => Promise.resolve('id-token'));
            signInWithEmailAndPassword.mockResolvedValue({
                user: { uid: 'user-1', getIdToken }
            });
            const dispatch = jest.fn();

            await auth('user@example.com', 'password', false)(dispatch);

            expect(getIdToken).toHaveBeenCalledTimes(1);
            expect(dispatch).toHaveBeenCalledWith({
                type: actionTypes.AUTH_SUCCESS,
                idToken: 'id-token',
                userId: 'user-1'
            });
        });

        it('should dispatch a failure when the credentials are rejected', async () => {
            signInWithEmailAndPassword.mockRejectedValue(new Error('wrong password'));
            const dispatch = jest.fn();

            await auth('user@example.com', 'bad', false)(dispatch);

            expect(dispatch).toHaveBeenCalledWith({
                type: actionTypes.AUTH_FAIL,
                error: { message: 'wrong password' }
            });
        });

        it('should dispatch a failure when the token cannot be read', async () => {
            createUserWithEmailAndPassword.mockResolvedValue(mockCredential({
                uid: 'user-1',
                getIdToken: jest.fn(() => Promise.reject(new Error('token failure')))
            }));
            const dispatch = jest.fn();

            await auth('user@example.com', 'password', true)(dispatch);

            expect(dispatch).toHaveBeenCalledWith({
                type: actionTypes.AUTH_FAIL,
                error: { message: 'token failure' }
            });
        });

        it('should fall back to a generic message when the error carries none', async () => {
            signInWithEmailAndPassword.mockRejectedValue({});
            const dispatch = jest.fn();

            await auth('user@example.com', 'bad', false)(dispatch);

            expect(dispatch).toHaveBeenCalledWith({
                type: actionTypes.AUTH_FAIL,
                error: { message: 'Authentication failed. Please try again.' }
            });
        });
    });

    describe('authCheckState thunk', () => {
        it('should return the unsubscribe function', () => {
            const unsubscribe = jest.fn();
            onAuthStateChanged.mockReturnValue(unsubscribe);
            const dispatch = jest.fn();

            const result = authCheckState()(dispatch);

            expect(result).toBe(unsubscribe);
        });

        it('should store the session when a user is signed in', async () => {
            onAuthStateChanged.mockImplementation((authInstance, callback) => {
                callback(mockUser);
                return jest.fn();
            });
            const dispatch = jest.fn();

            authCheckState()(dispatch);
            await flushPromises();

            expect(dispatch).toHaveBeenCalledWith({
                type: actionTypes.AUTH_SUCCESS,
                idToken: 'id-token',
                userId: 'user-1'
            });
        });

        it('should clear the session when no user is signed in', () => {
            onAuthStateChanged.mockImplementation((authInstance, callback) => {
                callback(null);
                return jest.fn();
            });
            const dispatch = jest.fn();

            authCheckState()(dispatch);

            expect(dispatch).toHaveBeenCalledWith({ type: actionTypes.AUTH_LOGOUT });
        });

        it('should dispatch a failure when the token cannot be read', async () => {
            onAuthStateChanged.mockImplementation((authInstance, callback) => {
                callback({
                    uid: 'user-1',
                    getIdToken: jest.fn(() => Promise.reject(new Error('token failure')))
                });
                return jest.fn();
            });
            const dispatch = jest.fn();

            authCheckState()(dispatch);
            await flushPromises();

            expect(dispatch).toHaveBeenCalledWith({
                type: actionTypes.AUTH_FAIL,
                error: { message: 'token failure' }
            });
        });
    });

    describe('signOutUser thunk', () => {
        it('should sign out and clear the session', async () => {
            signOut.mockResolvedValue(undefined);
            const dispatch = jest.fn();

            await signOutUser()(dispatch);

            expect(signOut).toHaveBeenCalledWith({ name: 'auth' });
            expect(dispatch).toHaveBeenCalledWith({ type: actionTypes.AUTH_LOGOUT });
        });

        it('should clear the session even when signing out fails', async () => {
            signOut.mockRejectedValue(new Error('network down'));
            const dispatch = jest.fn();

            await signOutUser()(dispatch);

            expect(dispatch).toHaveBeenCalledWith({ type: actionTypes.AUTH_LOGOUT });
        });
    });
});
