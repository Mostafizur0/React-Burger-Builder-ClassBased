import reducer from './order';
import * as actionTypes from '../actions/actionTypes';

const initialState = {
    orders: [],
    loading: false,
    purchased: false,
    error: null
};

describe('order reducer', () => {
    it('should return the initial state', () => {
        expect(reducer(undefined, {})).toEqual(initialState);
    });

    it('should reset the purchased flag', () => {
        expect(reducer(
            { ...initialState, purchased: true },
            { type: actionTypes.PURCHASE_INIT }
        )).toEqual(initialState);
    });

    it('should set loading on purchase start', () => {
        expect(reducer(initialState, { type: actionTypes.PURCHASE_BURGER_START }))
            .toEqual({ ...initialState, loading: true });
    });

    it('should append the purchased order', () => {
        const orderData = { price: 5.3, ingredients: { meat: 1 } };

        expect(reducer(initialState, {
            type: actionTypes.PURCHASE_BURGER_SUCCESS,
            orderId: 'order-1',
            orderData
        })).toEqual({
            ...initialState,
            purchased: true,
            orders: [{ id: 'order-1', price: 5.3, ingredients: { meat: 1 } }]
        });
    });

    it('should store the purchase failure', () => {
        const error = { message: 'The order could not be saved.' };

        expect(reducer(initialState, {
            type: actionTypes.PURCHASE_BURGER_FAIL,
            error
        })).toEqual({ ...initialState, error });
    });

    it('should store a null purchase failure when no error is given', () => {
        expect(reducer(initialState, { type: actionTypes.PURCHASE_BURGER_FAIL }))
            .toEqual(initialState);
    });

    it('should set loading on fetch start', () => {
        expect(reducer(initialState, { type: actionTypes.FETCH_ORDERS_START }))
            .toEqual({ ...initialState, loading: true });
    });

    it('should store the fetched orders', () => {
        const orders = [{ id: 'order-1', price: 5.3 }];

        expect(reducer(initialState, {
            type: actionTypes.FETCH_ORDERS_SUCCESS,
            orders
        })).toEqual({ ...initialState, orders });
    });

    it('should store the fetch failure', () => {
        const error = { message: 'Your orders could not be loaded.' };

        expect(reducer(initialState, {
            type: actionTypes.FETCH_ORDERS_FAIL,
            error
        })).toEqual({ ...initialState, error });
    });

    it('should store a null fetch failure when no error is given', () => {
        expect(reducer(initialState, { type: actionTypes.FETCH_ORDERS_FAIL }))
            .toEqual(initialState);
    });

    it('should clear the error', () => {
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
