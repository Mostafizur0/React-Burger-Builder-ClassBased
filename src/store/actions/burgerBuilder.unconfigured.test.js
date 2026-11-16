import * as actionTypes from './actionTypes';
import { initIngredients } from './burgerBuilder';
import { get } from 'firebase/database';

// The service module is mocked as unconfigured for this file, so the
// "backend not available" branch of the ingredient loader is exercised.
jest.mock('../../services/firebase', () => ({
    database: null,
    isFirebaseConfigured: false
}));

jest.mock('firebase/database', () => ({
    get: jest.fn(),
    ref: jest.fn()
}));

describe('burgerBuilder actions without a configured backend', () => {
    beforeEach(() => {
        get.mockReset();
    });

    it('should use the local defaults without contacting the database', async () => {
        const dispatch = jest.fn();

        await initIngredients()(dispatch);

        expect(dispatch).toHaveBeenCalledWith({
            type: actionTypes.SET_INGREDIENTS,
            ingredients: { salad: 0, bacon: 0, cheese: 0, meat: 0 }
        });
        expect(get).not.toHaveBeenCalled();
    });
});
