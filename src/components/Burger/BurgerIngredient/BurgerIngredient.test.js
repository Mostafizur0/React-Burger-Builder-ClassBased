import React from 'react';
import { render, screen } from '@testing-library/react';

import BurgerIngredient from './BurgerIngredient';

describe('<BurgerIngredient />', () => {
    it('should render the bottom bread', () => {
        render(<BurgerIngredient type="bread-bottom" />);

        expect(screen.getByTestId('bread-bottom')).toBeInTheDocument();
    });

    it('should render the top bread with its seeds', () => {
        render(<BurgerIngredient type="bread-top" />);

        expect(screen.getByTestId('bread-top')).toBeInTheDocument();
        expect(screen.getAllByTestId('seed')).toHaveLength(2);
    });

    it('should render the meat', () => {
        render(<BurgerIngredient type="meat" />);

        expect(screen.getByTestId('meat')).toBeInTheDocument();
    });

    it('should render the cheese', () => {
        render(<BurgerIngredient type="cheese" />);

        expect(screen.getByTestId('cheese')).toBeInTheDocument();
    });

    it('should render the bacon', () => {
        render(<BurgerIngredient type="bacon" />);

        expect(screen.getByTestId('bacon')).toBeInTheDocument();
    });

    it('should render the salad', () => {
        render(<BurgerIngredient type="salad" />);

        expect(screen.getByTestId('salad')).toBeInTheDocument();
    });

    it('should render nothing for an unknown type', () => {
        const { container } = render(<BurgerIngredient type="unknown" />);

        expect(container.innerHTML).toBe('');
    });
});
