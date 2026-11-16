import reducer from './auth';
import * as actionTypes from '../actions/actionTypes';

const initialState = {
    token: null,
    userId: null,
    error: null,
    loading: false,
    authRedirectPath: '/'
};

describe('auth reducer', () => {
    it('should return the initial state', () => {
        expect(reducer(undefined, {})).toEqual(initialState);
    });

    it('should store the token upon login', () => {
        expect(reducer(initialState, {
            type: actionTypes.AUTH_SUCCESS,
            idToken: 'some-token',
            userId: 'some-user-id'
        })).toEqual({
            token: 'some-token',
            userId: 'some-user-id',
            error: null,
            loading: false,
            authRedirectPath: '/'
        });
    });

    it('should set loading and clear the error on auth start', () => {
        expect(reducer(
            { ...initialState, error: { message: 'boom' } },
            { type: actionTypes.AUTH_START }
        )).toEqual({
            ...initialState,
            loading: true,
            error: null
        });
    });

    it('should store the error on auth failure', () => {
        expect(reducer(initialState, {
            type: actionTypes.AUTH_FAIL,
            error: { message: 'Invalid credentials' }
        })).toEqual({
            ...initialState,
            error: { message: 'Invalid credentials' }
        });
    });

    it('should clear the token on logout', () => {
        expect(reducer(
            { ...initialState, token: 'some-token', userId: 'some-user-id' },
            { type: actionTypes.AUTH_LOGOUT }
        )).toEqual(initialState);
    });

    it('should store the redirect path', () => {
        expect(reducer(initialState, {
            type: actionTypes.SET_AUTH_REDIRECT_PATH,
            path: '/checkout'
        })).toEqual({
            ...initialState,
            authRedirectPath: '/checkout'
        });
    });

    it('should clear the error on CLEAR_ERROR', () => {
        expect(reducer(
            { ...initialState, error: { message: 'boom' } },
            { type: actionTypes.CLEAR_ERROR }
        )).toEqual(initialState);
    });

    it('should ignore unknown actions', () => {
        const state = { ...initialState };
        expect(reducer(state, { type: 'UNKNOWN_ACTION' })).toBe(state);
    });
});
