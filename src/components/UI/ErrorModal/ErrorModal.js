import React, { Component } from 'react';
import { connect } from 'react-redux';

import Modal from '../Modal/Modal';

// Surfaces backend failures in a dismissible modal. Replaces the old HTTP
// interceptor HOC, which swallowed rejections instead of reporting them.
class ErrorModal extends Component {
    errorConfirmedHandler = () => {
        this.props.onClearError();
    }

    render () {
        const { error } = this.props;

        return (
            <Modal
                show={Boolean(error)}
                modalClosed={this.errorConfirmedHandler}>
                {error ? error.message : null}
            </Modal>
        );
    }
}

const mapStateToProps = state => {
    return {
        error: state.order.error || state.burgerBuilder.error || state.auth.error || null
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onClearError: () => dispatch({ type: 'CLEAR_ERROR' })
    };
};

export { ErrorModal };
export default connect(mapStateToProps, mapDispatchToProps)(ErrorModal);
