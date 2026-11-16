import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Input from './Input';

const defaultProps = {
    elementType: 'input',
    elementConfig: { type: 'text', placeholder: 'Name' },
    value: '',
    invalid: false,
    shouldValidate: {},
    touched: false,
    changed: jest.fn(),
    label: 'Label'
};

describe('<Input />', () => {
    it('should render a text input', () => {
        render(<Input {...defaultProps} />);

        expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    });

    it('should render a textarea', () => {
        render(<Input {...defaultProps} elementType="textarea" />);

        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render a select with its options', () => {
        render(
            <Input
                {...defaultProps}
                elementType="select"
                elementConfig={{
                    options: [
                        { value: 'fastest', displayValue: 'Fastest' },
                        { value: 'cheapest', displayValue: 'Cheapest' }
                    ]
                }}
                value="fastest" />
        );

        expect(screen.getByRole('combobox')).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Fastest' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Cheapest' })).toBeInTheDocument();
    });

    it('should fall back to an input for an unknown element type', () => {
        render(<Input {...defaultProps} elementType="unknown" />);

        expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    });

    it('should render the label', () => {
        render(<Input {...defaultProps} label="Your Name" />);

        expect(screen.getByText('Your Name')).toBeInTheDocument();
    });

    it('should mark the field invalid when it is invalid, validated and touched', () => {
        render(
            <Input {...defaultProps} invalid={true} shouldValidate={{ required: true }} touched={true} />
        );

        expect(screen.getByPlaceholderText('Name')).toHaveClass('Invalid');
    });

    it('should not mark the field invalid when it has not been touched', () => {
        render(
            <Input {...defaultProps} invalid={true} shouldValidate={{ required: true }} touched={false} />
        );

        expect(screen.getByPlaceholderText('Name')).not.toHaveClass('Invalid');
    });

    it('should call the change handler', async () => {
        const user = userEvent.setup();
        const changed = jest.fn();
        render(<Input {...defaultProps} changed={changed} />);

        await user.type(screen.getByPlaceholderText('Name'), 'a');

        expect(changed).toHaveBeenCalled();
    });
});
