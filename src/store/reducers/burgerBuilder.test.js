import reducer from './burgerBuilder';
import * as actionTypes from '../actions/actionTypes';

const initialState = {
    ingredients: null,
    totalPrice: 4,
    error: null,
    building: false
};

const loadedState = {
    ingredients: { salad: 0, bacon: 0, cheese: 1, meat: 1 },
    totalPrice: 5.7,
    error: null,
    building: true
};

describe('burgerBuilder reducer', () => {
    it('should return the initial state', () => {
        expect(reducer(undefined, {})).toEqual(initialState);
    });

    it('should add an ingredient and raise the price', () => {
        const state = reducer(
            { ...initialState, ingredients: { salad: 0, bacon: 0, cheese: 0, meat: 0 } },
            { type: actionTypes.ADD_INGREDIENT, ingredientName: 'meat' }
        );

        expect(state.ingredients.meat).toBe(1);
        expect(state.totalPrice).toBe(5.3);
        expect(state.building).toBe(true);
    });

    it('should subtract the price when an ingredient is removed', () => {
        const state = reducer(loadedState, {
            type: actionTypes.REMOVE_INGREDIENT,
            ingredientName: 'meat'
        });

        expect(state.ingredients.meat).toBe(0);
        expect(state.totalPrice).toBe(4.4);
    });

    it('should store the ingredients and reset the price', () => {
        const state = reducer(initialState, {
            type: actionTypes.SET_INGREDIENTS,
            ingredients: { salad: 1, bacon: 2, cheese: 3, meat: 4 }
        });

        expect(state.ingredients).toEqual({ salad: 1, bacon: 2, cheese: 3, meat: 4 });
        expect(state.totalPrice).toBe(4);
        expect(state.building).toBe(false);
        expect(state.error).toBeNull();
    });

    it('should store the failure error', () => {
        const error = { message: 'Ingredients could not be loaded.' };
        const state = reducer(initialState, {
            type: actionTypes.FETCH_INGREDIENTS_FAILED,
            error
        });

        expect(state.error).toEqual(error);
    });

    it('should fall back to a generic error message', () => {
        const state = reducer(initialState, { type: actionTypes.FETCH_INGREDIENTS_FAILED });

        expect(state.error).toEqual({ message: 'Ingredients could not be loaded.' });
    });

    it('should clear the error', () => {
        const state = reducer(
            { ...initialState, error: { message: 'boom' } },
            { type: actionTypes.CLEAR_ERROR }
        );

        expect(state.error).toBeNull();
    });

    it('should ignore unknown actions', () => {
        const state = { ...initialState };
        expect(reducer(state, { type: 'UNKNOWN_ACTION' })).toBe(state);
    });
});
