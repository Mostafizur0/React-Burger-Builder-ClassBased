import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../../test-utils';
import ContactData from './ContactData';

jest.mock('../../../store/actions/index', () => ({
    purchaseBurger: jest.fn((orderData, token) => ({ type: 'PURCHASE_BURGER_SUCCESS', orderId: 'order-1', orderData, token }))
}));

const loadedState = {
    burgerBuilder: {
        ingredients: { salad: 0, bacon: 0, cheese: 1, meat: 1 },
        totalPrice: 5.7,
        error: null,
        building: true
    },
    auth: {
        token: 'a-token',
        userId: 'user-1',
        error: null,
        loading: false,
        authRedirectPath: '/'
    }
};

const fillForm = async (user) => {
    await user.type(screen.getByPlaceholderText('Your Name'), 'Ada');
    await user.type(screen.getByPlaceholderText('Street'), 'Main Street');
    await user.type(screen.getByPlaceholderText('ZIP Code'), '12345');
    await user.type(screen.getByPlaceholderText('Country'), 'UK');
    await user.type(screen.getByPlaceholderText('Your E-Mail'), 'ada@example.com');
};

describe('<ContactData /> connected to the store', () => {
    it('should dispatch the order with the store data', async () => {
        const user = userEvent.setup();
        const { store } = renderWithProviders(<ContactData />, { preloadedState: loadedState });

        await fillForm(user);
        await user.click(screen.getByRole('button', { name: 'ORDER' }));

        expect(store.getState().order.purchased).toBe(true);
    });

    it('should map the loading state from the store', () => {
        renderWithProviders(<ContactData />, {
            preloadedState: {
                ...loadedState,
                order: { orders: [], loading: true, purchased: false, error: null }
            }
        });

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
});
