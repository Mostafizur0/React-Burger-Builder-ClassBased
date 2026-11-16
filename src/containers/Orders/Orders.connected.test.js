import React from 'react';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '../../test-utils';
import Orders from './Orders';

jest.mock('../../store/actions/index', () => ({
    fetchOrders: jest.fn((token, userId) => ({ type: 'FETCH_ORDERS', token, userId }))
}));

describe('<Orders /> connected to the store', () => {
    it('should dispatch the order fetch on mount', () => {
        renderWithProviders(<Orders />, {
            preloadedState: {
                auth: {
                    token: 'a-token',
                    userId: 'user-1',
                    error: null,
                    loading: false,
                    authRedirectPath: '/'
                }
            }
        });

        // The mapped dispatch handler runs against the real store.
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('should render the orders held in the store', () => {
        renderWithProviders(<Orders />, {
            preloadedState: {
                order: {
                    orders: [{ id: 'order-1', price: 5.7, ingredients: { meat: 1 } }],
                    loading: false,
                    purchased: false,
                    error: null
                }
            }
        });

        expect(screen.getByText('meat (1)')).toBeInTheDocument();
    });
});
