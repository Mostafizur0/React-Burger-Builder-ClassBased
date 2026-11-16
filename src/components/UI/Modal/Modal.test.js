import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Modal from './Modal';

describe('<Modal />', () => {
    it('should render the children', () => {
        render(<Modal show={true}>Modal body</Modal>);

        expect(screen.getByText('Modal body')).toBeInTheDocument();
    });

    it('should be positioned off-screen when hidden', () => {
        render(<Modal show={false}>Modal body</Modal>);

        expect(screen.getByTestId('modal')).toHaveStyle({ transform: 'translateY(-100vh)' });
    });

    it('should be positioned on-screen when shown', () => {
        render(<Modal show={true}>Modal body</Modal>);

        expect(screen.getByTestId('modal')).toHaveStyle({ transform: 'translateY(0)' });
    });

    it('should call modalClosed when the backdrop is clicked', async () => {
        const user = userEvent.setup();
        const modalClosed = jest.fn();
        render(<Modal show={true} modalClosed={modalClosed}>Modal body</Modal>);

        await user.click(screen.getByTestId('backdrop'));

        expect(modalClosed).toHaveBeenCalled();
    });
});
