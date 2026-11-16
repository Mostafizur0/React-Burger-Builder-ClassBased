import * as actionTypes from './actionTypes';
import { ref, get } from 'firebase/database';

import { database, isFirebaseConfigured } from '../../services/firebase';
import { DEFAULT_INGREDIENTS } from '../../shared/defaultIngredients';

export const addIngredient = (name) => {
    return {
        type: actionTypes.ADD_INGREDIENT,
        ingredientName: name
    };
};

export const removeIngredient = (name) => {
    return {
        type: actionTypes.REMOVE_INGREDIENT,
        ingredientName: name
    };
};

export const setIngredients = (ingredients) => {
    return {
        type: actionTypes.SET_INGREDIENTS,
        ingredients: ingredients
    };
};

export const fetchIngredientsFailed = (error) => {
    return {
        type: actionTypes.FETCH_INGREDIENTS_FAILED,
        error: error
    };
};

// Reads the ingredient counts from the Realtime Database. Any failure, missing
// node or unconfigured backend falls back to the local defaults so the builder
// always renders.
// The Realtime Database SDK keeps a websocket open, so a misconfigured or
// unreachable project can leave the request pending forever. The read is
// capped so the builder always renders with the local defaults.
const INGREDIENTS_TIMEOUT_MS = 5000;

export const initIngredients = () => {
    return dispatch => {
        if (!isFirebaseConfigured || !database) {
            dispatch(setIngredients(DEFAULT_INGREDIENTS));
            return Promise.resolve();
        }

        const timeout = new Promise((resolve, reject) => {
            setTimeout(() => reject(new Error('Ingredient request timed out.')), INGREDIENTS_TIMEOUT_MS);
        });

        return Promise.race([get(ref(database, 'ingredients')), timeout])
            .then(snapshot => {
                const value = snapshot && snapshot.val ? snapshot.val() : null;
                if (!value) {
                    dispatch(setIngredients(DEFAULT_INGREDIENTS));
                    return;
                }
                // Merge over the defaults so a partial `ingredients` node cannot
                // leave a count undefined, which would produce a NaN price.
                dispatch(setIngredients({ ...DEFAULT_INGREDIENTS, ...value }));
            })
            .catch(error => {
                // Defaults are set first: `setIngredients` clears the error slot,
                // so the failure is recorded afterwards to survive.
                dispatch(setIngredients(DEFAULT_INGREDIENTS));
                dispatch(fetchIngredientsFailed({ message: 'Ingredients could not be loaded from the server.' }));
            });
    };
};
