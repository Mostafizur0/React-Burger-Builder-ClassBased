import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../../test-utils';
import { ContactData } from './ContactData';

const createProps = () => ({
    ings: { salad: 0, bacon: 0, cheese: 1, meat: 1 },
    price: 5.7,
    loading: false,
    error: null,
    token: 'a-token',
    userId: 'user-1',
    onOrderBurger: jest.fn()
});

describe('<ContactData />', () => {
    let props;

    beforeEach(() => {
        props = createProps();
    });

    it('should render every form field', () => {
        renderWithProviders(<ContactData {...props} />);

        expect(screen.getByPlaceholderText('Your Name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Street')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('ZIP Code')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Country')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Your E-Mail')).toBeInTheDocument();
        expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should keep the order button disabled until the form is valid', async () => {
        const user = userEvent.setup();
        renderWithProviders(<ContactData {...props} />);

        expect(screen.getByRole('button', { name: 'ORDER' })).toBeDisabled();

        await user.type(screen.getByPlaceholderText('Your Name'), 'Ada');
        await user.type(screen.getByPlaceholderText('Street'), 'Main Street');
        await user.type(screen.getByPlaceholderText('ZIP Code'), '12345');
        await user.type(screen.getByPlaceholderText('Country'), 'UK');
        await user.type(screen.getByPlaceholderText('Your E-Mail'), 'ada@example.com');

        expect(screen.getByRole('button', { name: 'ORDER' })).toBeEnabled();
    });

    it('should order the burger with the entered contact data', async () => {
        const user = userEvent.setup();
        renderWithProviders(<ContactData {...props} />);

        await user.type(screen.getByPlaceholderText('Your Name'), 'Ada');
        await user.type(screen.getByPlaceholderText('Street'), 'Main Street');
        await user.type(screen.getByPlaceholderText('ZIP Code'), '12345');
        await user.type(screen.getByPlaceholderText('Country'), 'UK');
        await user.type(screen.getByPlaceholderText('Your E-Mail'), 'ada@example.com');
        await user.click(screen.getByRole('button', { name: 'ORDER' }));

        expect(props.onOrderBurger).toHaveBeenCalledWith(
            {
                ingredients: props.ings,
                price: props.price,
                orderData: {
                    name: 'Ada',
                    street: 'Main Street',
                    zipCode: '12345',
                    country: 'UK',
                    email: 'ada@example.com',
                    deliveryMethod: 'fastest'
                },
                userId: 'user-1'
            },
            'a-token'
        );
    });

    it('should show the spinner while the order is being placed', () => {
        renderWithProviders(<ContactData {...props} loading={true} />);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
});
