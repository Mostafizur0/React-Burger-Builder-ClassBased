import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../test-utils';
import { Auth } from './Auth';

const createProps = () => ({
    loading: false,
    error: null,
    isAuthenticated: false,
    buildingBurger: false,
    authRedirectPath: '/',
    onAuth: jest.fn(),
    onSetAuthRedirectPath: jest.fn(),
    history: { push: jest.fn(), replace: jest.fn(), goBack: jest.fn() }
});

describe('<Auth />', () => {
    let props;

    beforeEach(() => {
        props = createProps();
    });

    it('should render the email and password fields', () => {
        renderWithProviders(<Auth {...props} />);

        expect(screen.getByPlaceholderText('Mail Address')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    });

    it('should render a submit button and a mode switch button', () => {
        renderWithProviders(<Auth {...props} />);

        expect(screen.getByRole('button', { name: 'SUBMIT' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'SWITCH TO SIGNIN' })).toBeInTheDocument();
    });

    it('should switch to the sign-in mode', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Auth {...props} />);

        await user.click(screen.getByRole('button', { name: 'SWITCH TO SIGNIN' }));

        expect(screen.getByRole('button', { name: 'SWITCH TO SIGNUP' })).toBeInTheDocument();
    });

    it('should show the spinner while authenticating', () => {
        renderWithProviders(<Auth {...props} loading={true} />);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should show the error message', () => {
        renderWithProviders(<Auth {...props} error={{ message: 'Invalid credentials' }} />);

        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    it('should call onAuth with the entered credentials on submit', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Auth {...props} />);

        await user.type(screen.getByPlaceholderText('Mail Address'), 'user@example.com');
        await user.type(screen.getByPlaceholderText('Password'), 'secret123');
        await user.click(screen.getByRole('button', { name: 'SUBMIT' }));

        expect(props.onAuth).toHaveBeenCalledWith('user@example.com', 'secret123', true);
    });

    it('should call onAuth with the sign-in flag after switching mode', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Auth {...props} />);

        await user.click(screen.getByRole('button', { name: 'SWITCH TO SIGNIN' }));
        await user.type(screen.getByPlaceholderText('Mail Address'), 'user@example.com');
        await user.type(screen.getByPlaceholderText('Password'), 'secret123');
        await user.click(screen.getByRole('button', { name: 'SUBMIT' }));

        expect(props.onAuth).toHaveBeenCalledWith('user@example.com', 'secret123', false);
    });
});
