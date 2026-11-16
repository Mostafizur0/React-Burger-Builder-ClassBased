import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';

import burgerBuilderReducer from './store/reducers/burgerBuilder';
import orderReducer from './store/reducers/order';
import authReducer from './store/reducers/auth';

export const rootReducer = combineReducers({
    burgerBuilder: burgerBuilderReducer,
    order: orderReducer,
    auth: authReducer
});

// Builds a store from the real reducers so tests exercise production logic.
export const createTestStore = (preloadedState = {}) => {
    return createStore(rootReducer, preloadedState, applyMiddleware(thunk));
};

export const renderWithProviders = (ui, options = {}) => {
    const {
        store = createTestStore(options.preloadedState),
        route = '/',
        ...renderOptions
    } = options;

    const Wrapper = ({ children }) => (
        <Provider store={store}>
            <MemoryRouter initialEntries={[route]}>
                {children}
            </MemoryRouter>
        </Provider>
    );

    return {
        store,
        ...render(ui, { wrapper: Wrapper, ...renderOptions })
    };
};

export default renderWithProviders;
