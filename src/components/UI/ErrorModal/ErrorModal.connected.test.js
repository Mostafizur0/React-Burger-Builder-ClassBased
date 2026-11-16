import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../../test-utils';
import ErrorModal from './ErrorModal';

describe('<ErrorModal /> connected to the store', () => {
    it('should show the order error held in the store', () => {
        renderWithProviders(<ErrorModal />, {
            preloadedState: {
                order: {
                    orders: [],
                    loading: false,
                    purchased: false,
                    error: { message: 'The order could not be saved.' }
                }
            }
        });

        expect(screen.getByText('The order could not be saved.')).toBeInTheDocument();
    });

    it('should show the auth error held in the store', () => {
        renderWithProviders(<ErrorModal />, {
            preloadedState: {
                auth: {
                    token: null,
                    userId: null,
                    error: { message: 'Authentication failed.' },
                    loading: false,
                    authRedirectPath: '/'
                }
            }
        });

        expect(screen.getByText('Authentication failed.')).toBeInTheDocument();
    });

    it('should show the ingredient error held in the store', () => {
        renderWithProviders(<ErrorModal />, {
            preloadedState: {
                burgerBuilder: {
                    ingredients: null,
                    totalPrice: 4,
                    error: { message: 'Ingredients could not be loaded.' },
                    building: false
                }
            }
        });

        expect(screen.getByText('Ingredients could not be loaded.')).toBeInTheDocument();
    });

    it('should clear the error when dismissed', async () => {
        const user = userEvent.setup();
        const { store } = renderWithProviders(<ErrorModal />, {
            preloadedState: {
                order: {
                    orders: [],
                    loading: false,
                    purchased: false,
                    error: { message: 'The order could not be saved.' }
                }
            }
        });

        await user.click(screen.getByTestId('backdrop'));

        expect(store.getState().order.error).toBeNull();
    });
});
