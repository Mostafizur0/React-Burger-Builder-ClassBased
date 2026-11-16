import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Backdrop from './Backdrop';

describe('<Backdrop />', () => {
    it('should render nothing when hidden', () => {
        render(<Backdrop show={false} clicked={jest.fn()} />);

        expect(screen.queryByTestId('backdrop')).not.toBeInTheDocument();
    });

    it('should render the backdrop when shown', () => {
        render(<Backdrop show={true} clicked={jest.fn()} />);

        expect(screen.getByTestId('backdrop')).toBeInTheDocument();
    });

    it('should call the click handler', async () => {
        const user = userEvent.setup();
        const clicked = jest.fn();
        render(<Backdrop show={true} clicked={clicked} />);

        await user.click(screen.getByTestId('backdrop'));

        expect(clicked).toHaveBeenCalled();
    });
});
