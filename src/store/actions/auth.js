import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';

import * as actionTypes from './actionTypes';
import { auth as firebaseAuth, isFirebaseConfigured } from '../../services/firebase';

export const authStart = () => {
    return {
        type: actionTypes.AUTH_START
    };
};

export const authSuccess = (token, userId) => {
    return {
        type: actionTypes.AUTH_SUCCESS,
        idToken: token,
        userId: userId
    };
};

export const authFail = (error) => {
    return {
        type: actionTypes.AUTH_FAIL,
        error: error
    };
};

export const logout = () => {
    return {
        type: actionTypes.AUTH_LOGOUT
    };
};

// Normalises Firebase auth errors into a plain message object.
const toAuthError = (error) => ({
    message: (error && error.message) || 'Authentication failed. Please try again.'
});

export const auth = (email, password, isSignup) => {
    return dispatch => {
        if (!isFirebaseConfigured || !firebaseAuth) {
            dispatch(authFail({ message: 'Authentication is not configured for this deployment.' }));
            return;
        }

        dispatch(authStart());

        const request = isSignup
            ? createUserWithEmailAndPassword(firebaseAuth, email, password)
            : signInWithEmailAndPassword(firebaseAuth, email, password);

        // The SDK resolves with a UserCredential; the User itself - the object
        // that owns getIdToken() - lives on its `user` property.
        return request
            .then(credential => credential.user)
            .then(user => user.getIdToken().then(idToken => ({ idToken, uid: user.uid })))
            .then(({ idToken, uid }) => {
                dispatch(authSuccess(idToken, uid));
            })
            .catch(error => {
                dispatch(authFail(toAuthError(error)));
            });
    };
};

export const setAuthRedirectPath = (path) => {
    return {
        type: actionTypes.SET_AUTH_REDIRECT_PATH,
        path: path
    };
};

// Subscribes to Firebase auth state. Returns the unsubscribe function so the
// caller can detach the listener on unmount.
export const authCheckState = () => {
    return dispatch => {
        if (!isFirebaseConfigured || !firebaseAuth) {
            dispatch(logout());
            return () => {};
        }

        return onAuthStateChanged(firebaseAuth, user => {
            if (user) {
                user.getIdToken()
                    .then(idToken => {
                        dispatch(authSuccess(idToken, user.uid));
                    })
                    .catch(error => {
                        dispatch(authFail(toAuthError(error)));
                    });
            } else {
                dispatch(logout());
            }
        });    };
};

// Signs the user out of Firebase, then clears local session state.
export const signOutUser = () => {
    return dispatch => {
        const clearSession = () => dispatch(logout());

        if (!isFirebaseConfigured || !firebaseAuth) {
            clearSession();
            return Promise.resolve();
        }

        return signOut(firebaseAuth).then(clearSession).catch(clearSession);
    };
};
