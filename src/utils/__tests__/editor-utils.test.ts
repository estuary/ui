import {
    CANCEL_EXCEPTION,
    DEFAULT_HEIGHT,
    DEFAULT_TOOLBAR_HEIGHT,
    getEditorEventReason,
    getEditorTotalHeight,
    ignorableEditorException,
} from 'src/utils/editor-utils';

describe('getEditorTotalHeight', () => {
    test('uses defaults when no arguments are provided', () => {
        expect(getEditorTotalHeight()).toBe(
            DEFAULT_HEIGHT + DEFAULT_TOOLBAR_HEIGHT + 2
        );
    });

    test('uses provided editor height and default toolbar height', () => {
        expect(getEditorTotalHeight(400)).toBe(
            400 + DEFAULT_TOOLBAR_HEIGHT + 2
        );
    });

    test('uses provided values for both heights', () => {
        expect(getEditorTotalHeight(400, 30)).toBe(432);
    });

    test('adds the 2px border offset in all cases', () => {
        expect(getEditorTotalHeight(0, 0)).toBe(2);
    });
});

describe('getEditorEventReason', () => {
    test('returns null when event is null or undefined', () => {
        expect(getEditorEventReason(null)).toBeNull();
        expect(getEditorEventReason(undefined)).toBeNull();
    });

    test('returns null when event has no reason property', () => {
        expect(getEditorEventReason({})).toBeNull();
    });

    test('returns reason.message when present', () => {
        expect(getEditorEventReason({ reason: { message: 'Canceled' } })).toBe(
            'Canceled'
        );
    });

    test('falls back to reason.name when message is absent', () => {
        expect(getEditorEventReason({ reason: { name: 'AbortError' } })).toBe(
            'AbortError'
        );
    });

    test('returns null when reason has neither message nor name', () => {
        expect(getEditorEventReason({ reason: {} })).toBeNull();
    });
});

describe('ignorableEditorException', () => {
    test('returns true for a Canceled event', () => {
        expect(
            ignorableEditorException({ reason: { message: CANCEL_EXCEPTION } })
        ).toBe(true);
    });

    test('returns false for other event types', () => {
        expect(
            ignorableEditorException({ reason: { message: 'SomeOtherError' } })
        ).toBe(false);
    });

    test('returns false for null input', () => {
        expect(ignorableEditorException(null)).toBe(false);
    });
});
