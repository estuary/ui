import { hasAckTxnFlag } from 'src/hooks/journals/shared';

// Acknowledgement documents are runtime bookkeeping written into collection and
// ops journals at every transaction commit. They carry no collection key, so the
// data preview renders them as an empty-keyed row, and the logs table as a row
// with no level or message.
//
// The fourth hyphen-delimited group of a Gazette message UUID is composed as
// `0x8000 | (clock_sequence & 0x3c00) | flags`, so it varies with the clock and
// cannot be compared against a fixed value. ACK_TXN is 0x2 within the flags.
// See `build` in crates/proto-gazette/src/uuid.rs of estuary/flow.
const ACK_UUID = '9f8e7d6c-1234-11f0-8002-4336974cbbe3';
const ACK_UUID_WITH_CLOCK_SEQUENCE = '9f8e7d6c-1234-11f0-bc02-4336974cbbe3';
const CONTINUE_TXN_UUID = 'd2659611-f267-11f0-8001-4336974cbbe3';
const OUTSIDE_TXN_UUID = 'd2659611-f267-11f0-8000-4336974cbbe3';
const OUTSIDE_TXN_UUID_WITH_CLOCK_SEQUENCE =
    'd2659611-f267-11f0-b400-4336974cbbe3';

describe('hasAckTxnFlag', () => {
    describe('runtime v1 acknowledgements', () => {
        // The collection ack template built by crates/validation/src/collection.rs.
        test('collection acknowledgement, with `ack` inside `_meta`', () => {
            const document = { _meta: { uuid: ACK_UUID, ack: true } };

            expect(hasAckTxnFlag(document._meta.uuid)).toBe(true);
        });

        // The ops ack template built by go/runtime/ops_publisher.go, which places
        // `ack` at the document root rather than inside `_meta`.
        test('ops acknowledgement, with `ack` at the root', () => {
            const document = { _meta: { uuid: ACK_UUID }, ack: true };

            expect(hasAckTxnFlag(document._meta.uuid)).toBe(true);
        });
    });

    describe('runtime v2 acknowledgements', () => {
        // The shapes written by crates/publisher/src/intents.rs.
        test('acknowledgement carrying causal hints', () => {
            const document = {
                _meta: { uuid: ACK_UUID },
                is_ack: true,
                hints: [{ j: [0, 'the/journal/name'], p: [] }],
            };

            expect(hasAckTxnFlag(document._meta.uuid)).toBe(true);
        });

        test('secondary acknowledgement, which omits hints', () => {
            const document = { _meta: { uuid: ACK_UUID }, is_ack: true };

            expect(hasAckTxnFlag(document._meta.uuid)).toBe(true);
        });

        test('acknowledgement carrying a backfill marker', () => {
            const document = {
                _meta: { uuid: ACK_UUID },
                is_ack: true,
                backfillBegin: true,
            };

            expect(hasAckTxnFlag(document._meta.uuid)).toBe(true);
        });
    });

    describe('collection documents', () => {
        test('CONTINUE_TXN document is kept', () => {
            const document = { _meta: { uuid: CONTINUE_TXN_UUID }, id: 1 };

            expect(hasAckTxnFlag(document._meta.uuid)).toBe(false);
        });

        test('OUTSIDE_TXN document is kept', () => {
            expect(hasAckTxnFlag(OUTSIDE_TXN_UUID)).toBe(false);
        });

        // A user's schema may legitimately define `is_ack`, which is why the flag
        // rather than the field determines whether a document is bookkeeping.
        test('document defining its own `is_ack` field is kept', () => {
            const document = {
                _meta: { uuid: CONTINUE_TXN_UUID },
                is_ack: true,
            };

            expect(hasAckTxnFlag(document._meta.uuid)).toBe(false);
        });
    });

    describe('clock-sequence bits', () => {
        test('acknowledgement is matched when clock-sequence bits are set', () => {
            expect(hasAckTxnFlag(ACK_UUID_WITH_CLOCK_SEQUENCE)).toBe(true);
        });

        test('document is kept when clock-sequence bits are set', () => {
            expect(hasAckTxnFlag(OUTSIDE_TXN_UUID_WITH_CLOCK_SEQUENCE)).toBe(
                false
            );
        });
    });

    describe('uninterpretable UUIDs are kept', () => {
        test('empty string', () => {
            expect(hasAckTxnFlag('')).toBe(false);
        });

        // `Number.parseInt` stops at the first non-hex character, so a partially
        // parsed group must not be mistaken for a set of flags.
        test('not a UUID', () => {
            expect(hasAckTxnFlag('not-a-uuid-at-all-x')).toBe(false);
        });

        test('truncated UUID', () => {
            expect(hasAckTxnFlag('9f8e7d6c-1234-11f0-800')).toBe(false);
        });

        test('zero UUID', () => {
            expect(hasAckTxnFlag('00000000-0000-0000-0000-000000000000')).toBe(
                false
            );
        });
    });

    test('is case insensitive', () => {
        expect(hasAckTxnFlag(ACK_UUID_WITH_CLOCK_SEQUENCE.toUpperCase())).toBe(
            true
        );
    });
});
