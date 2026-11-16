import React from 'react';
import { render, screen } from '@testing-library/react';

import Aux from './Aux';

describe('<Aux />', () => {
    it('should render its children', () => {
        render(<Aux><span>Child</span></Aux>);

        expect(screen.getByText('Child')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
        render(
            <Aux>
                <span>First</span>
                <span>Second</span>
            </Aux>
        );

        expect(screen.getByText('First')).toBeInTheDocument();
        expect(screen.getByText('Second')).toBeInTheDocument();
    });
});
