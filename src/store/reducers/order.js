import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../../shared/utility';

const initialState = {
    orders: [],
    loading: false,
    purchased: false,
    error: null
};

const purchaseInit = (state, action) => {
    return updateObject(state, { purchased: false });
};

const purchaseBurgerStart = (state, action) => {
    return updateObject(state, { loading: true, error: null });
};

const purchaseBurgerSuccess = (state, action) => {
    const newOrder = updateObject(action.orderData, { id: action.orderId });
    return updateObject(state, {
        loading: false,
        purchased: true,
        error: null,
        orders: state.orders.concat(newOrder)
    });
};

const purchaseBurgerFail = (state, action) => {
    return updateObject(state, { loading: false, error: action.error || null });
};

const fetchOrdersStart = (state, action) => {
    return updateObject(state, { loading: true, error: null });
};

const fetchOrdersSuccess = (state, action) => {
    return updateObject(state, {
        orders: action.orders,
        loading: false,
        error: null
    });
};

const fetchOrdersFail = (state, action) => {
    return updateObject(state, { loading: false, error: action.error || null });
};

const clearError = (state, action) => {
    return updateObject(state, { error: null });
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.PURCHASE_INIT: return purchaseInit(state, action);
        case actionTypes.PURCHASE_BURGER_START: return purchaseBurgerStart(state, action);
        case actionTypes.PURCHASE_BURGER_SUCCESS: return purchaseBurgerSuccess(state, action)
        case actionTypes.PURCHASE_BURGER_FAIL: return purchaseBurgerFail(state, action);
        case actionTypes.FETCH_ORDERS_START: return fetchOrdersStart(state, action);
        case actionTypes.FETCH_ORDERS_SUCCESS: return fetchOrdersSuccess(state, action);
        case actionTypes.FETCH_ORDERS_FAIL: return fetchOrdersFail(state, action);
        case actionTypes.CLEAR_ERROR: return clearError(state, action);
        default: return state;
    }
};

export default reducer;
