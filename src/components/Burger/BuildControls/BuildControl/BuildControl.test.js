import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import BuildControl from './BuildControl';

const defaultProps = {
    label: 'Meat',
    added: jest.fn(),
    removed: jest.fn(),
    disabled: false
};

describe('<BuildControl />', () => {
    it('should render the label', () => {
        render(<BuildControl {...defaultProps} />);

        expect(screen.getByText('Meat')).toBeInTheDocument();
    });

    it('should call added when the More button is clicked', async () => {
        const user = userEvent.setup();
        const added = jest.fn();
        render(<BuildControl {...defaultProps} added={added} />);

        await user.click(screen.getByRole('button', { name: 'More' }));

        expect(added).toHaveBeenCalled();
    });

    it('should call removed when the Less button is clicked', async () => {
        const user = userEvent.setup();
        const removed = jest.fn();
        render(<BuildControl {...defaultProps} removed={removed} />);

        await user.click(screen.getByRole('button', { name: 'Less' }));

        expect(removed).toHaveBeenCalled();
    });

    it('should disable the Less button when disabled is true', () => {
        render(<BuildControl {...defaultProps} disabled={true} />);

        expect(screen.getByRole('button', { name: 'Less' })).toBeDisabled();
    });
});
