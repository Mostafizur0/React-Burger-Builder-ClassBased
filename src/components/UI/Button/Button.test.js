import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Button from './Button';

describe('<Button />', () => {
    it('should render its children', () => {
        render(<Button btnType="Success">SUBMIT</Button>);

        expect(screen.getByRole('button', { name: 'SUBMIT' })).toBeInTheDocument();
    });

    it('should apply the type class', () => {
        render(<Button btnType="Danger">CANCEL</Button>);

        expect(screen.getByRole('button', { name: 'CANCEL' })).toHaveClass('Danger');
    });

    it('should call the click handler', async () => {
        const user = userEvent.setup();
        const clicked = jest.fn();
        render(<Button btnType="Success" clicked={clicked}>SUBMIT</Button>);

        await user.click(screen.getByRole('button', { name: 'SUBMIT' }));

        expect(clicked).toHaveBeenCalled();
    });

    it('should be disabled when the disabled prop is set', () => {
        render(<Button btnType="Success" disabled={true}>SUBMIT</Button>);

        expect(screen.getByRole('button', { name: 'SUBMIT' })).toBeDisabled();
    });
});
