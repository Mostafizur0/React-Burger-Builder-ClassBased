import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../test-utils';
import { Checkout } from './Checkout';

const createProps = () => ({
    ings: { salad: 0, bacon: 0, cheese: 1, meat: 1 },
    purchased: false,
    history: { push: jest.fn(), replace: jest.fn(), goBack: jest.fn() },
    match: { path: '/checkout' }
});

describe('<Checkout />', () => {
    let props;

    beforeEach(() => {
        props = createProps();
    });

    it('should render the checkout summary', () => {
        renderWithProviders(<Checkout {...props} />);

        expect(screen.getByText('We hope it tastes well!')).toBeInTheDocument();
    });

    it('should redirect home when there are no ingredients', () => {
        renderWithProviders(<Checkout {...props} ings={null} />);

        expect(screen.queryByText('We hope it tastes well!')).not.toBeInTheDocument();
    });

    it('should go back when the purchase is cancelled', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Checkout {...props} />);

        await user.click(screen.getByRole('button', { name: 'CANCEL' }));

        expect(props.history.goBack).toHaveBeenCalled();
    });

    it('should move to the contact data step when the purchase continues', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Checkout {...props} />);

        await user.click(screen.getByRole('button', { name: 'CONTINUE' }));

        expect(props.history.replace).toHaveBeenCalledWith('/checkout/contact-data');
    });

    it('should render the contact data form on the contact-data route', () => {
        renderWithProviders(<Checkout {...props} />, { route: '/checkout/contact-data' });

        expect(screen.getByText('Enter your Contact Data')).toBeInTheDocument();
    });
});
