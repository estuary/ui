import {
    detectAutoCompleteInputReset,
    detectRemoveOptionWithBackspace,
} from 'src/utils/mui-utils';

describe('detectRemoveOptionWithBackspace', () => {
    const makeEvent = (type: string, key: string) => ({ type, key }) as any;

    test('returns true when keydown + Backspace + removeOption', () => {
        expect(
            detectRemoveOptionWithBackspace(
                makeEvent('keydown', 'Backspace'),
                'removeOption'
            )
        ).toBe(true);
    });

    test('returns false when key is not Backspace', () => {
        expect(
            detectRemoveOptionWithBackspace(
                makeEvent('keydown', 'Delete'),
                'removeOption'
            )
        ).toBe(false);
    });

    test('returns false when event type is not keydown', () => {
        expect(
            detectRemoveOptionWithBackspace(
                makeEvent('click', 'Backspace'),
                'removeOption'
            )
        ).toBe(false);
    });

    test('returns false when reason is not removeOption', () => {
        expect(
            detectRemoveOptionWithBackspace(
                makeEvent('keydown', 'Backspace'),
                'selectOption'
            )
        ).toBe(false);
    });
});

describe('detectAutoCompleteInputReset', () => {
    test('returns true for "reset" reason', () => {
        expect(detectAutoCompleteInputReset('reset')).toBe(true);
    });

    test('returns false for other reasons', () => {
        expect(detectAutoCompleteInputReset('input')).toBe(false);
        expect(detectAutoCompleteInputReset('clear')).toBe(false);
    });
});
