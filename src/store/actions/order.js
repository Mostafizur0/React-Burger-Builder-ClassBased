import * as actionTypes from './actionTypes';
import { ref, get, push, query, orderByChild, equalTo } from 'firebase/database';

import { database, isFirebaseConfigured } from '../../services/firebase';

export const purchaseBurgerSuccess = (id, orderData) => {
    return {
        type: actionTypes.PURCHASE_BURGER_SUCCESS,
        orderId: id,
        orderData: orderData
    };
};

export const purchaseBurgerFail = (error) => {
    return {
        type: actionTypes.PURCHASE_BURGER_FAIL,
        error: error
    };
};

export const purchaseBurgerStart = () => {
    return {
        type: actionTypes.PURCHASE_BURGER_START
    };
};

export const purchaseInit = () => {
    return {
        type: actionTypes.PURCHASE_INIT
    };
};

export const fetchOrdersSuccess = (orders) => {
    return {
        type: actionTypes.FETCH_ORDERS_SUCCESS,
        orders: orders
    };
};

export const fetchOrdersFail = (error) => {
    return {
        type: actionTypes.FETCH_ORDERS_FAIL,
        error: error
    };
};

export const fetchOrdersStart = () => {
    return {
        type: actionTypes.FETCH_ORDERS_START
    };
};

// Writes the order to the Realtime Database. The SDK signs the request with the
// signed-in user's credentials, so no token is ever placed in the URL.
export const purchaseBurger = (orderData, token) => {
    return dispatch => {
        dispatch(purchaseBurgerStart());

        if (!isFirebaseConfigured || !database) {
            dispatch(purchaseBurgerFail({ message: 'Ordering is not configured for this deployment.' }));
            return Promise.resolve();
        }

        return push(ref(database, 'orders'), orderData)
            .then(orderRef => {
                dispatch(purchaseBurgerSuccess(orderRef.key, orderData));
            })
            .catch(error => {
                dispatch(purchaseBurgerFail({ message: 'The order could not be saved.' }));
            });
    };
};

// Reads back only the orders belonging to the signed-in user. The database
// rules enforce the same restriction server-side.
export const fetchOrders = (token, userId) => {
    return dispatch => {
        dispatch(fetchOrdersStart());

        if (!isFirebaseConfigured || !database) {
            dispatch(fetchOrdersSuccess([]));
            return Promise.resolve();
        }

        const ordersQuery = query(ref(database, 'orders'), orderByChild('userId'), equalTo(userId));

        return get(ordersQuery)
            .then(snapshot => {
                const fetchedOrders = [];
                const value = snapshot && snapshot.val ? snapshot.val() : null;
                if (value) {
                    for (let key in value) {
                        fetchedOrders.push({
                            ...value[key],
                            id: key
                        });
                    }
                }
                dispatch(fetchOrdersSuccess(fetchedOrders));
            })
            .catch(error => {
                dispatch(fetchOrdersFail({ message: 'Your orders could not be loaded.' }));
            });
    };
};
