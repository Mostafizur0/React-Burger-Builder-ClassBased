import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../test-utils';
import BurgerBuilder from './BurgerBuilder';

jest.mock('../../store/actions/index', () => ({
    addIngredient: jest.fn((name) => ({ type: 'ADD_INGREDIENT', ingredientName: name })),
    removeIngredient: jest.fn((name) => ({ type: 'REMOVE_INGREDIENT', ingredientName: name })),
    initIngredients: jest.fn(() => ({ type: 'INIT_INGREDIENTS' })),
    purchaseInit: jest.fn(() => ({ type: 'PURCHASE_INIT' })),
    setAuthRedirectPath: jest.fn((path) => ({ type: 'SET_AUTH_REDIRECT_PATH', path }))
}));

const loadedState = {
    burgerBuilder: {
        ingredients: { salad: 0, bacon: 0, cheese: 1, meat: 1 },
        totalPrice: 5.7,
        error: null,
        building: true
    }
};

describe('<BurgerBuilder /> connected to the store', () => {
    it('should render the ingredients held in the store', () => {
        renderWithProviders(<BurgerBuilder />, { preloadedState: loadedState });

        expect(screen.getByText('5.70')).toBeInTheDocument();
    });

    it('should add an ingredient to the store', async () => {
        const user = userEvent.setup();
        const { store } = renderWithProviders(<BurgerBuilder />, { preloadedState: loadedState });

        await user.click(screen.getAllByRole('button', { name: 'More' })[0]);

        expect(store.getState().burgerBuilder.ingredients.salad).toBe(1);
        expect(store.getState().burgerBuilder.totalPrice).toBe(6.2);
    });

    it('should remove an ingredient from the store', async () => {
        const user = userEvent.setup();
        const { store } = renderWithProviders(<BurgerBuilder />, { preloadedState: loadedState });

        await user.click(screen.getAllByRole('button', { name: 'Less' })[2]);

        expect(store.getState().burgerBuilder.ingredients.cheese).toBe(0);
        expect(store.getState().burgerBuilder.totalPrice).toBe(5.3);
    });

    it('should reset the purchase state when the order is continued', async () => {
        const user = userEvent.setup();
        const { store } = renderWithProviders(<BurgerBuilder />, {
            preloadedState: {
                ...loadedState,
                auth: {
                    token: 'a-token',
                    userId: 'user-1',
                    error: null,
                    loading: false,
                    authRedirectPath: '/'
                }
            }
        });

        await user.click(screen.getByRole('button', { name: 'ORDER NOW' }));
        await user.click(screen.getByRole('button', { name: 'CONTINUE' }));

        expect(store.getState().order.purchased).toBe(false);
    });

    it('should store the auth redirect path for anonymous visitors', async () => {
        const user = userEvent.setup();
        const { store } = renderWithProviders(<BurgerBuilder />, { preloadedState: loadedState });

        await user.click(screen.getByRole('button', { name: 'SIGN UP TO ORDER' }));

        expect(store.getState().auth.authRedirectPath).toBe('/checkout');
    });
});
