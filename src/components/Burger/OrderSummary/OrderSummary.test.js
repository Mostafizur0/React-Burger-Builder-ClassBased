import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import OrderSummary from './OrderSummary';

const defaultProps = {
    ingredients: { salad: 1, bacon: 0, cheese: 2, meat: 1 },
    price: 5.7,
    purchaseCancelled: jest.fn(),
    purchaseContinued: jest.fn()
};

describe('<OrderSummary />', () => {
    it('should list every ingredient with its count', () => {
        render(<OrderSummary {...defaultProps} />);

        expect(screen.getByText('salad')).toBeInTheDocument();
        expect(screen.getByText('cheese')).toBeInTheDocument();
        expect(screen.getByText('meat')).toBeInTheDocument();
    });

    it('should render the total price', () => {
        render(<OrderSummary {...defaultProps} />);

        expect(screen.getByText('Total Price: 5.70')).toBeInTheDocument();
    });

    it('should call purchaseCancelled when the cancel button is clicked', async () => {
        const user = userEvent.setup();
        const purchaseCancelled = jest.fn();
        render(<OrderSummary {...defaultProps} purchaseCancelled={purchaseCancelled} />);

        await user.click(screen.getByRole('button', { name: 'CANCEL' }));

        expect(purchaseCancelled).toHaveBeenCalled();
    });

    it('should call purchaseContinued when the continue button is clicked', async () => {
        const user = userEvent.setup();
        const purchaseContinued = jest.fn();
        render(<OrderSummary {...defaultProps} purchaseContinued={purchaseContinued} />);

        await user.click(screen.getByRole('button', { name: 'CONTINUE' }));

        expect(purchaseContinued).toHaveBeenCalled();
    });
});
