import { DEFAULT_INGREDIENTS, INGREDIENT_PRICES, BASE_PRICE } from './defaultIngredients';

describe('default ingredients', () => {
    it('should expose a zeroed count for every ingredient', () => {
        expect(DEFAULT_INGREDIENTS).toEqual({
            salad: 0,
            bacon: 0,
            cheese: 0,
            meat: 0
        });
    });

    it('should price every ingredient', () => {
        expect(Object.keys(INGREDIENT_PRICES).sort()).toEqual(['bacon', 'cheese', 'meat', 'salad']);
    });

    it('should start from the base price', () => {
        expect(BASE_PRICE).toBe(4);
    });
});
