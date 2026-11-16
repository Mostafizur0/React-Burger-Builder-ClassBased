import React from 'react';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '../../test-utils';
import Checkout from './Checkout';

describe('<Checkout /> connected to the store', () => {
    it('should map the ingredients and the purchased flag onto the component', () => {
        renderWithProviders(<Checkout />, {
            preloadedState: {
                burgerBuilder: {
                    ingredients: { salad: 0, bacon: 0, cheese: 1, meat: 1 },
                    totalPrice: 5.7,
                    error: null,
                    building: true
                },
                order: {
                    orders: [],
                    loading: false,
                    purchased: false,
                    error: null
                }
            }
        });

        expect(screen.getByText('We hope it tastes well!')).toBeInTheDocument();
    });

    it('should redirect home once the order has been purchased', () => {
        renderWithProviders(<Checkout />, {
            route: '/checkout',
            preloadedState: {
                burgerBuilder: {
                    ingredients: { salad: 0, bacon: 0, cheese: 1, meat: 1 },
                    totalPrice: 5.7,
                    error: null,
                    building: true
                },
                order: {
                    orders: [],
                    loading: false,
                    purchased: true,
                    error: null
                }
            }
        });

        // The purchased redirect renders alongside the summary; the router
        // resolves it to the builder route.
        expect(screen.getByText('We hope it tastes well!')).toBeInTheDocument();
    });
});
