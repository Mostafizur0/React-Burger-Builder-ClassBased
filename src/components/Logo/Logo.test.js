import React from 'react';
import { render, screen } from '@testing-library/react';

import Logo from './Logo';

describe('<Logo />', () => {
    it('should render the burger logo image', () => {
        render(<Logo />);

        expect(screen.getByAltText('MyBurger')).toBeInTheDocument();
    });

    it('should apply the given height', () => {
        render(<Logo height="3rem" />);

        expect(screen.getByTestId('logo')).toHaveStyle({ height: '3rem' });
    });
});
