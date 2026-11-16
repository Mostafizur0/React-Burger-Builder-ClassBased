import React from 'react';
import { render, screen } from '@testing-library/react';

import Burger from './Burger';

describe('<Burger />', () => {
    it('should render the top and bottom bread', () => {
        render(<Burger ingredients={{ salad: 0, bacon: 0, cheese: 0, meat: 0 }} />);

        expect(screen.getByTestId('bread-top')).toBeInTheDocument();
        expect(screen.getByTestId('bread-bottom')).toBeInTheDocument();
    });

    it('should ask the user to start adding ingredients when empty', () => {
        render(<Burger ingredients={{ salad: 0, bacon: 0, cheese: 0, meat: 0 }} />);

        expect(screen.getByText('Please start adding ingredients!')).toBeInTheDocument();
    });

    it('should render one ingredient element per count', () => {
        render(<Burger ingredients={{ salad: 1, bacon: 2, cheese: 0, meat: 3 }} />);

        expect(screen.getAllByTestId('salad')).toHaveLength(1);
        expect(screen.getAllByTestId('bacon')).toHaveLength(2);
        expect(screen.getAllByTestId('meat')).toHaveLength(3);
        expect(screen.queryByTestId('cheese')).not.toBeInTheDocument();
        expect(screen.queryByText('Please start adding ingredients!')).not.toBeInTheDocument();
    });
});
