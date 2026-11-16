import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../../test-utils';
import { ErrorModal } from './ErrorModal';

describe('<ErrorModal />', () => {
    const createProps = () => ({
        error: null,
        onClearError: jest.fn()
    });

    it('should stay hidden when there is no error', () => {
        const props = createProps();
        renderWithProviders(<ErrorModal {...props} />);

        expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });

    it('should show the error message', () => {
        const props = createProps();
        renderWithProviders(
            <ErrorModal {...props} error={{ message: 'Something went wrong' }} />
        );

        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should clear the error when the modal is dismissed', async () => {
        const user = userEvent.setup();
        const props = createProps();
        renderWithProviders(
            <ErrorModal {...props} error={{ message: 'Something went wrong' }} />
        );

        await user.click(screen.getByTestId('backdrop'));

        expect(props.onClearError).toHaveBeenCalled();
    });
});
