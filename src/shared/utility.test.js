import { updateObject, checkValidity } from './utility';

describe('updateObject', () => {
    it('should merge the updated properties into the old object', () => {
        const oldObject = { a: 1, b: 2 };
        const updated = updateObject(oldObject, { b: 3, c: 4 });

        expect(updated).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('should not mutate the original object', () => {
        const oldObject = { a: 1 };
        updateObject(oldObject, { a: 2 });

        expect(oldObject).toEqual({ a: 1 });
    });
});

describe('checkValidity', () => {
    it('should return true when no rules are supplied', () => {
        expect(checkValidity('anything', undefined)).toBe(true);
    });

    it('should return true when the rules object is empty', () => {
        expect(checkValidity('anything', {})).toBe(true);
    });

    describe('required rule', () => {
        it('should reject an empty string', () => {
            expect(checkValidity('', { required: true })).toBe(false);
        });

        it('should reject a whitespace-only string', () => {
            expect(checkValidity('   ', { required: true })).toBe(false);
        });

        it('should accept a non-empty string', () => {
            expect(checkValidity('value', { required: true })).toBe(true);
        });
    });

    describe('minLength rule', () => {
        it('should reject a value that is too short', () => {
            expect(checkValidity('abc', { minLength: 5 })).toBe(false);
        });

        it('should accept a value at the minimum length', () => {
            expect(checkValidity('abcde', { minLength: 5 })).toBe(true);
        });
    });

    describe('maxLength rule', () => {
        it('should reject a value that is too long', () => {
            expect(checkValidity('abcdef', { maxLength: 5 })).toBe(false);
        });

        it('should accept a value at the maximum length', () => {
            expect(checkValidity('abcde', { maxLength: 5 })).toBe(true);
        });
    });

    describe('isEmail rule', () => {
        it('should accept a valid email address', () => {
            expect(checkValidity('user@example.com', { isEmail: true })).toBe(true);
        });

        it('should reject an invalid email address', () => {
            expect(checkValidity('not-an-email', { isEmail: true })).toBe(false);
        });

        it('should reject an email without a domain', () => {
            expect(checkValidity('user@', { isEmail: true })).toBe(false);
        });
    });

    describe('isNumeric rule', () => {
        it('should accept a numeric string', () => {
            expect(checkValidity('12345', { isNumeric: true })).toBe(true);
        });

        it('should reject a non-numeric string', () => {
            expect(checkValidity('12a45', { isNumeric: true })).toBe(false);
        });

        it('should reject a negative number', () => {
            expect(checkValidity('-12345', { isNumeric: true })).toBe(false);
        });
    });

    it('should require every rule to pass', () => {
        const rules = { required: true, minLength: 5, isNumeric: true };

        expect(checkValidity('12345', rules)).toBe(true);
        expect(checkValidity('123', rules)).toBe(false);
        expect(checkValidity('12345a', rules)).toBe(false);
        expect(checkValidity('', rules)).toBe(false);
    });
});
