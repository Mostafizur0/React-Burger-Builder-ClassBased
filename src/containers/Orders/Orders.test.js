import React from 'react';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '../../test-utils';
import { Orders } from './Orders';

describe('<Orders />', () => {
    const createProps = () => ({
        orders: [],
        loading: false,
        error: null,
        token: 'a-token',
        userId: 'user-1',
        onFetchOrders: jest.fn()
    });

    it('should call onFetchOrders on mount', () => {
        const props = createProps();
        renderWithProviders(<Orders {...props} />);

        expect(props.onFetchOrders).toHaveBeenCalledWith('a-token', 'user-1');
    });

    it('should show the spinner while loading', () => {
        renderWithProviders(<Orders {...createProps()} loading={true} />);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render the fetched orders', () => {
        renderWithProviders(
            <Orders
                {...createProps()}
                orders={[{ id: 'order-1', price: 5.7, ingredients: { meat: 1 } }]} />
        );

        expect(screen.getByText('meat (1)')).toBeInTheDocument();
        expect(screen.getByText('USD 5.70')).toBeInTheDocument();
    });

    it('should render nothing when there are no orders', () => {
        renderWithProviders(<Orders {...createProps()} />);

        expect(screen.queryByTestId('order')).not.toBeInTheDocument();
    });
});
