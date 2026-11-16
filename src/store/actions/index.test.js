import * as actions from './index';

describe('action index', () => {
    it('should expose the burger builder action creators', () => {
        expect(typeof actions.addIngredient).toBe('function');
        expect(typeof actions.removeIngredient).toBe('function');
        expect(typeof actions.initIngredients).toBe('function');
    });

    it('should expose the order action creators', () => {
        expect(typeof actions.purchaseBurger).toBe('function');
        expect(typeof actions.purchaseInit).toBe('function');
        expect(typeof actions.fetchOrders).toBe('function');
    });

    it('should expose the auth action creators', () => {
        expect(typeof actions.auth).toBe('function');
        expect(typeof actions.logout).toBe('function');
        expect(typeof actions.setAuthRedirectPath).toBe('function');
        expect(typeof actions.authCheckState).toBe('function');
        expect(typeof actions.signOutUser).toBe('function');
    });

    it('should dispatch the exported creators', () => {
        expect(actions.addIngredient('meat')).toEqual({
            type: 'ADD_INGREDIENT',
            ingredientName: 'meat'
        });
        expect(actions.purchaseInit()).toEqual({ type: 'PURCHASE_INIT' });
        expect(actions.logout()).toEqual({ type: 'AUTH_LOGOUT' });
    });
});
