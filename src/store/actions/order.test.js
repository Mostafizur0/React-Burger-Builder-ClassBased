import { get, push, ref, query, orderByChild, equalTo } from 'firebase/database';

import * as actionTypes from './actionTypes';
import { purchaseBurger, fetchOrders, purchaseInit } from './order';

jest.mock('firebase/database', () => ({
    get: jest.fn(),
    push: jest.fn(),
    ref: jest.fn(() => ({ path: 'orders' })),
    query: jest.fn(() => ({ path: 'orders-query' })),
    orderByChild: jest.fn(() => 'orderByChild'),
    equalTo: jest.fn(() => 'equalTo')
}));

jest.mock('../../services/firebase', () => ({
    database: { name: 'database' },
    isFirebaseConfigured: true
}));

describe('order actions', () => {
    beforeEach(() => {
        get.mockReset();
        push.mockReset();
        ref.mockClear();
        query.mockClear();
        orderByChild.mockClear();
        equalTo.mockClear();
    });

    it('should create the purchase init action', () => {
        expect(purchaseInit()).toEqual({ type: actionTypes.PURCHASE_INIT });
    });

    describe('purchaseBurger thunk', () => {
        const order = { ingredients: { meat: 1 }, price: 5.3, userId: 'user-1' };

        it('should save the order and store the generated id', async () => {
            push.mockResolvedValue({ key: 'order-1' });
            const dispatch = jest.fn();

            await purchaseBurger(order, 'token')(dispatch);

            expect(dispatch).toHaveBeenCalledWith({ type: actionTypes.PURCHASE_BURGER_START });
            expect(dispatch).toHaveBeenCalledWith({
                type: actionTypes.PURCHASE_BURGER_SUCCESS,
                orderId: 'order-1',
                orderData: order
            });
        });

        it('should dispatch a failure when the order cannot be saved', async () => {
            push.mockRejectedValue(new Error('permission denied'));
            const dispatch = jest.fn();

            await purchaseBurger(order, 'token')(dispatch);

            expect(dispatch).toHaveBeenCalledWith({
                type: actionTypes.PURCHASE_BURGER_FAIL,
                error: { message: 'The order could not be saved.' }
            });
        });
    });

    describe('fetchOrders thunk', () => {
        it('should query the orders of the given user', async () => {
            get.mockResolvedValue({ val: () => null });
            const dispatch = jest.fn();

            await fetchOrders('token', 'user-1')(dispatch);

            expect(orderByChild).toHaveBeenCalledWith('userId');
            expect(equalTo).toHaveBeenCalledWith('user-1');
            expect(dispatch).toHaveBeenCalledWith({ type: actionTypes.FETCH_ORDERS_START });
            expect(dispatch).toHaveBeenCalledWith({
                type: actionTypes.FETCH_ORDERS_SUCCESS,
                orders: []
            });
        });

        it('should attach the database key as the order id', async () => {
            get.mockResolvedValue({
                val: () => ({
                    'order-1': { price: 5.3, ingredients: { meat: 1 } },
                    'order-2': { price: 4.4, ingredients: { cheese: 1 } }
                })
            });
            const dispatch = jest.fn();

            await fetchOrders('token', 'user-1')(dispatch);

            expect(dispatch).toHaveBeenCalledWith({
                type: actionTypes.FETCH_ORDERS_SUCCESS,
                orders: [
                    { id: 'order-1', price: 5.3, ingredients: { meat: 1 } },
                    { id: 'order-2', price: 4.4, ingredients: { cheese: 1 } }
                ]
            });
        });

        it('should return an empty list when the snapshot carries no value', async () => {
            get.mockResolvedValue({});
            const dispatch = jest.fn();

            await fetchOrders('token', 'user-1')(dispatch);

            expect(dispatch).toHaveBeenCalledWith({
                type: actionTypes.FETCH_ORDERS_SUCCESS,
                orders: []
            });
        });

        it('should dispatch a failure when the orders cannot be loaded', async () => {
            get.mockRejectedValue(new Error('permission denied'));
            const dispatch = jest.fn();

            await fetchOrders('token', 'user-1')(dispatch);

            expect(dispatch).toHaveBeenCalledWith({
                type: actionTypes.FETCH_ORDERS_FAIL,
                error: { message: 'Your orders could not be loaded.' }
            });
        });
    });
});
