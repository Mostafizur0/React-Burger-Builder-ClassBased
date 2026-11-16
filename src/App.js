import React, { Component, Suspense, lazy } from 'react';
import { Route, Switch, withRouter, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import Layout from './hoc/Layout/Layout';
import BurgerBuilder from './containers/BurgerBuilder/BurgerBuilder';
import Logout from './containers/Auth/Logout/Logout';
import Spinner from './components/UI/Spinner/Spinner';
import * as actions from './store/actions/index';

const asyncCheckout = lazy(() => import('./containers/Checkout/Checkout'));
const asyncOrders = lazy(() => import('./containers/Orders/Orders'));
const asyncAuth = lazy(() => import('./containers/Auth/Auth'));

class App extends Component {
    componentDidMount () {
        this.unsubscribeAuth = this.props.onTryAutoSignup();
    }

    componentWillUnmount () {
        if ( typeof this.unsubscribeAuth === 'function' ) {
            this.unsubscribeAuth();
        }
    }

    render () {
        let routes = (
            <Switch>
                <Route path="/auth" component={asyncAuth} />
                <Route path="/" exact component={BurgerBuilder} />
                <Redirect to="/" />
            </Switch>
        );

        if ( this.props.isAuthenticated ) {
            routes = (
                <Switch>
                    <Route path="/checkout" component={asyncCheckout} />
                    <Route path="/orders" component={asyncOrders} />
                    <Route path="/logout" component={Logout} />
                    <Route path="/auth" component={asyncAuth} />
                    <Route path="/" exact component={BurgerBuilder} />
                    <Redirect to="/" />
                </Switch>
            );
        }

        return (
            <div>
                <Layout>
                    <Suspense fallback={<Spinner />}>
                        {routes}
                    </Suspense>
                </Layout>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        isAuthenticated: state.auth.token !== null
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onTryAutoSignup: () => dispatch( actions.authCheckState() )
    };
};

export { App };
export default withRouter( connect( mapStateToProps, mapDispatchToProps )( App ) );
