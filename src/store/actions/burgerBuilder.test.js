import { get, ref } from 'firebase/database';

import * as actionTypes from './actionTypes';
import { DEFAULT_INGREDIENTS } from '../../shared/defaultIngredients';
import { initIngredients, setIngredients, fetchIngredientsFailed, addIngredient, removeIngredient } from './burgerBuilder';

jest.mock('firebase/database', () => ({
    get: jest.fn(),
    ref: jest.fn(() => ({ path: 'ingredients' }))
}));

jest.mock('../../services/firebase', () => ({
    database: { name: 'database' },
    isFirebaseConfigured: true
}));

describe('burgerBuilder actions', () => {
    beforeEach(() => {
        get.mockReset();
        ref.mockClear();
    });

    describe('plain action creators', () => {
        it('should create the add ingredient action', () => {
            expect(addIngredient('meat')).toEqual({
                type: actionTypes.ADD_INGREDIENT,
                ingredientName: 'meat'
            });
        });

        it('should create the remove ingredient action', () => {
            expect(removeIngredient('meat')).toEqual({
                type: actionTypes.REMOVE_INGREDIENT,
                ingredientName: 'meat'
            });
        });

        it('should create the set ingredients action', () => {
            expect(setIngredients({ salad: 1 })).toEqual({
                type: actionTypes.SET_INGREDIENTS,
                ingredients: { salad: 1 }
            });
        });

        it('should create the fetch failure action', () => {
            const error = { message: 'nope' };
            expect(fetchIngredientsFailed(error)).toEqual({
                type: actionTypes.FETCH_INGREDIENTS_FAILED,
                error
            });
        });
    });

    describe('initIngredients thunk', () => {
        it('should store the ingredients returned by the database', async () => {
            get.mockResolvedValue({
                val: () => ({ salad: 2, bacon: 1, cheese: 0, meat: 3 })
            });
            const dispatch = jest.fn();

            await initIngredients()(dispatch);

            expect(ref).toHaveBeenCalledWith({ name: 'database' }, 'ingredients');
            expect(dispatch).toHaveBeenCalledWith({
                type: actionTypes.SET_INGREDIENTS,
                ingredients: { salad: 2, bacon: 1, cheese: 0, meat: 3 }
            });
        });

        it('should fall back to the defaults when the node is empty', async () => {
            get.mockResolvedValue({ val: () => null });
            const dispatch = jest.fn();

            await initIngredients()(dispatch);

            expect(dispatch).toHaveBeenCalledWith({
                type: actionTypes.SET_INGREDIENTS,
                ingredients: DEFAULT_INGREDIENTS
            });
        });

        it('should fall back to the defaults when the snapshot has no value method', async () => {
            get.mockResolvedValue({});
            const dispatch = jest.fn();

            await initIngredients()(dispatch);

            expect(dispatch).toHaveBeenCalledWith({
                type: actionTypes.SET_INGREDIENTS,
                ingredients: DEFAULT_INGREDIENTS
            });
        });

        it('should fall back to the defaults and record the error when the request fails', async () => {
            get.mockRejectedValue(new Error('network down'));
            const dispatch = jest.fn();

            await initIngredients()(dispatch);

            expect(dispatch).toHaveBeenCalledWith({
                type: actionTypes.SET_INGREDIENTS,
                ingredients: DEFAULT_INGREDIENTS
            });
            expect(dispatch).toHaveBeenCalledWith({
                type: actionTypes.FETCH_INGREDIENTS_FAILED,
                error: { message: 'Ingredients could not be loaded from the server.' }
            });
        });

        it('should merge remote counts over the local defaults', async () => {
            get.mockResolvedValue({ val: () => ({ salad: 5 }) });
            const dispatch = jest.fn();

            await initIngredients()(dispatch);

            expect(dispatch).toHaveBeenCalledWith({
                type: actionTypes.SET_INGREDIENTS,
                ingredients: { ...DEFAULT_INGREDIENTS, salad: 5 }
            });
        });

        it('should fall back to the defaults when the request never settles', async () => {
            jest.useFakeTimers();
            // A Realtime Database read against an unreachable project stays
            // pending, because the SDK keeps the websocket open.
            get.mockReturnValue(new Promise(() => {}));
            const dispatch = jest.fn();

            const pending = initIngredients()(dispatch);
            jest.advanceTimersByTime(5000);
            await pending;
            jest.useRealTimers();

            expect(dispatch).toHaveBeenCalledWith({
                type: actionTypes.SET_INGREDIENTS,
                ingredients: DEFAULT_INGREDIENTS
            });
            expect(dispatch).toHaveBeenCalledWith({
                type: actionTypes.FETCH_INGREDIENTS_FAILED,
                error: { message: 'Ingredients could not be loaded from the server.' }
            });
        });
    });
});
