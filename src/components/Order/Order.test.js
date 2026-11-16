import React from 'react';
import { render, screen } from '@testing-library/react';

import Order from './Order';

describe('<Order />', () => {
    it('should list every ingredient with its amount', () => {
        render(<Order ingredients={{ salad: 1, meat: 2 }} price={6.7} />);

        expect(screen.getByText('salad (1)')).toBeInTheDocument();
        expect(screen.getByText('meat (2)')).toBeInTheDocument();
    });

    it('should render the price', () => {
        render(<Order ingredients={{ salad: 1 }} price={6.7} />);

        expect(screen.getByText('USD 6.70')).toBeInTheDocument();
    });

    it('should parse a string price', () => {
        render(<Order ingredients={{ salad: 1 }} price="6.7" />);

        expect(screen.getByText('USD 6.70')).toBeInTheDocument();
    });
});
