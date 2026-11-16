import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../test-utils';
import { BurgerBuilder } from './BurgerBuilder';

const ingredients = { salad: 0, bacon: 0, cheese: 1, meat: 1 };

const createProps = () => ({
    ings: ingredients,
    price: 5.7,
    error: null,
    isAuthenticated: false,
    onIngredientAdded: jest.fn(),
    onIngredientRemoved: jest.fn(),
    onInitIngredients: jest.fn(),
    onInitPurchase: jest.fn(),
    onSetAuthRedirectPath: jest.fn(),
    history: { push: jest.fn(), replace: jest.fn(), goBack: jest.fn() }
});

// The modal is hidden with an inline transform rather than being unmounted,
// so visibility is asserted through that style.
const getModal = () => screen.getByTestId('order-summary-modal');

describe('<BurgerBuilder />', () => {
    let props;

    beforeEach(() => {
        props = createProps();
    });

    it('should render the burger and the build controls when ingredients are loaded', () => {
        renderWithProviders(<BurgerBuilder {...props} />);

        expect(screen.getByText(/Current Price:/)).toBeInTheDocument();
        expect(screen.getAllByRole('button', { name: 'More' })).toHaveLength(4);
    });

    it('should render a spinner while ingredients are not loaded', () => {
        renderWithProviders(<BurgerBuilder {...props} ings={null} />);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should call onInitIngredients on mount', () => {
        renderWithProviders(<BurgerBuilder {...props} />);

        expect(props.onInitIngredients).toHaveBeenCalledTimes(1);
    });

    it('should show the signup prompt and redirect to auth when not authenticated', async () => {
        const user = userEvent.setup();
        renderWithProviders(<BurgerBuilder {...props} />);

        await user.click(screen.getByRole('button', { name: 'SIGN UP TO ORDER' }));

        expect(props.onSetAuthRedirectPath).toHaveBeenCalledWith('/checkout');
        expect(props.history.push).toHaveBeenCalledWith('/auth');
    });

    it('should open the order summary when authenticated', async () => {
        const user = userEvent.setup();
        renderWithProviders(<BurgerBuilder {...props} isAuthenticated={true} />);

        await user.click(screen.getByRole('button', { name: 'ORDER NOW' }));

        expect(screen.getByText('Your Order')).toBeInTheDocument();
        expect(getModal()).toHaveStyle('transform: translateY(0)');
    });

    it('should hide the order summary when the purchase is cancelled', async () => {
        const user = userEvent.setup();
        renderWithProviders(<BurgerBuilder {...props} isAuthenticated={true} />);

        await user.click(screen.getByRole('button', { name: 'ORDER NOW' }));
        await user.click(screen.getByRole('button', { name: 'CANCEL' }));

        expect(getModal()).toHaveStyle('transform: translateY(-100vh)');
    });

    it('should continue to checkout from the order summary', async () => {
        const user = userEvent.setup();
        renderWithProviders(<BurgerBuilder {...props} isAuthenticated={true} />);

        await user.click(screen.getByRole('button', { name: 'ORDER NOW' }));
        await user.click(screen.getByRole('button', { name: 'CONTINUE' }));

        expect(props.onInitPurchase).toHaveBeenCalledTimes(1);
        expect(props.history.push).toHaveBeenCalledWith('/checkout');
    });

    it('should add an ingredient when the More button is clicked', async () => {
        const user = userEvent.setup();
        renderWithProviders(<BurgerBuilder {...props} />);

        await user.click(screen.getAllByRole('button', { name: 'More' })[0]);

        expect(props.onIngredientAdded).toHaveBeenCalled();
    });

    it('should remove an ingredient when the Less button is clicked', async () => {
        const user = userEvent.setup();
        renderWithProviders(<BurgerBuilder {...props} />);

        await user.click(screen.getAllByRole('button', { name: 'Less' })[2]);

        expect(props.onIngredientRemoved).toHaveBeenCalled();
    });

    it('should disable the Less button for ingredients at zero', () => {
        renderWithProviders(<BurgerBuilder {...props} />);

        const lessButtons = screen.getAllByRole('button', { name: 'Less' });
        expect(lessButtons[0]).toBeDisabled();
        expect(lessButtons[3]).not.toBeDisabled();
    });

    it('should disable the order button when no ingredients are present', () => {
        renderWithProviders(<BurgerBuilder {...props} ings={{ salad: 0, bacon: 0, cheese: 0, meat: 0 }} />);

        expect(screen.getByRole('button', { name: 'SIGN UP TO ORDER' })).toBeDisabled();
    });
});
