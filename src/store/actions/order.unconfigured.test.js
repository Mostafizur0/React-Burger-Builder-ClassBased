import * as actionTypes from './actionTypes';
import { purchaseBurger, fetchOrders } from './order';
import { get, push } from 'firebase/database';

// The service module is mocked as unconfigured for this file, so the
// "backend not available" branches of the thunks are exercised.
jest.mock('../../services/firebase', () => ({
    database: null,
    isFirebaseConfigured: false
}));

jest.mock('firebase/database', () => ({
    get: jest.fn(),
    push: jest.fn(),
    ref: jest.fn(),
    query: jest.fn(),
    orderByChild: jest.fn(),
    equalTo: jest.fn()
}));

describe('order actions without a configured backend', () => {
    beforeEach(() => {
        get.mockReset();
        push.mockReset();
    });

    it('should report that ordering is unavailable', async () => {
        const dispatch = jest.fn();

        await purchaseBurger({ price: 5.3 }, 'token')(dispatch);

        expect(dispatch).toHaveBeenCalledWith({
            type: actionTypes.PURCHASE_BURGER_FAIL,
            error: { message: 'Ordering is not configured for this deployment.' }
        });
        expect(push).not.toHaveBeenCalled();
    });

    it('should return an empty order list', async () => {
        const dispatch = jest.fn();

        await fetchOrders('token', 'user-1')(dispatch);

        expect(dispatch).toHaveBeenCalledWith({
            type: actionTypes.FETCH_ORDERS_SUCCESS,
            orders: []
        });
        expect(get).not.toHaveBeenCalled();
    });
});
