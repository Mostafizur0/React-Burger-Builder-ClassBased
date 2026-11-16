import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import BuildControls from './BuildControls';

const defaultProps = {
    price: 5.7,
    ingredients: { salad: 0, bacon: 0, cheese: 1, meat: 1 },
    disabled: { salad: true, bacon: true, cheese: false, meat: false },
    purchasable: true,
    ordered: jest.fn(),
    ingredientAdded: jest.fn(),
    ingredientRemoved: jest.fn(),
    isAuth: true
};

describe('<BuildControls />', () => {
    it('should render the current price', () => {
        render(<BuildControls {...defaultProps} />);

        expect(screen.getByText('5.70')).toBeInTheDocument();
    });

    it('should render one control per ingredient', () => {
        render(<BuildControls {...defaultProps} />);

        expect(screen.getAllByRole('button', { name: 'More' })).toHaveLength(4);
        expect(screen.getAllByRole('button', { name: 'Less' })).toHaveLength(4);
    });

    it('should show the order button as ORDER NOW when authenticated', () => {
        render(<BuildControls {...defaultProps} isAuth={true} />);

        expect(screen.getByRole('button', { name: 'ORDER NOW' })).toBeInTheDocument();
    });

    it('should show the order button as SIGN UP TO ORDER when not authenticated', () => {
        render(<BuildControls {...defaultProps} isAuth={false} />);

        expect(screen.getByRole('button', { name: 'SIGN UP TO ORDER' })).toBeInTheDocument();
    });

    it('should disable the order button when the burger is not purchasable', () => {
        render(<BuildControls {...defaultProps} purchasable={false} />);

        expect(screen.getByRole('button', { name: 'ORDER NOW' })).toBeDisabled();
    });

    it('should call ingredientAdded with the ingredient type', async () => {
        const user = userEvent.setup();
        const ingredientAdded = jest.fn();
        render(<BuildControls {...defaultProps} ingredientAdded={ingredientAdded} />);

        await user.click(screen.getAllByRole('button', { name: 'More' })[0]);

        expect(ingredientAdded).toHaveBeenCalledWith('salad');
    });

    it('should call ingredientRemoved with the ingredient type', async () => {
        const user = userEvent.setup();
        const ingredientRemoved = jest.fn();
        render(<BuildControls {...defaultProps} ingredientRemoved={ingredientRemoved} />);

        // Index 2 is cheese, which is not disabled in the default props.
        await user.click(screen.getAllByRole('button', { name: 'Less' })[2]);

        expect(ingredientRemoved).toHaveBeenCalledWith('cheese');
    });

    it('should call ordered when the order button is clicked', async () => {
        const user = userEvent.setup();
        const ordered = jest.fn();
        render(<BuildControls {...defaultProps} ordered={ordered} />);

        await user.click(screen.getByRole('button', { name: 'ORDER NOW' }));

        expect(ordered).toHaveBeenCalled();
    });
});
