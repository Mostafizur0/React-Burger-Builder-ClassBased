import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CheckoutSummary from './CheckoutSummary';

const defaultProps = {
    ingredients: { salad: 1, bacon: 0, cheese: 2, meat: 1 },
    checkoutCancelled: jest.fn(),
    checkoutContinued: jest.fn()
};

describe('<CheckoutSummary />', () => {
    it('should render the heading and the burger', () => {
        render(<CheckoutSummary {...defaultProps} />);

        expect(screen.getByText('We hope it tastes well!')).toBeInTheDocument();
        expect(screen.getByTestId('burger')).toBeInTheDocument();
    });

    it('should call checkoutCancelled when the cancel button is clicked', async () => {
        const user = userEvent.setup();
        const checkoutCancelled = jest.fn();
        render(<CheckoutSummary {...defaultProps} checkoutCancelled={checkoutCancelled} />);

        await user.click(screen.getByRole('button', { name: 'CANCEL' }));

        expect(checkoutCancelled).toHaveBeenCalled();
    });

    it('should call checkoutContinued when the continue button is clicked', async () => {
        const user = userEvent.setup();
        const checkoutContinued = jest.fn();
        render(<CheckoutSummary {...defaultProps} checkoutContinued={checkoutContinued} />);

        await user.click(screen.getByRole('button', { name: 'CONTINUE' }));

        expect(checkoutContinued).toHaveBeenCalled();
    });
});
