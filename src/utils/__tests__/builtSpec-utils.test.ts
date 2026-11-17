import type * as FlowWeb from '@estuary/flow-web';

import { resolve_built_collections } from '@estuary/flow-web';

import { logRocketEvent } from 'src/services/shared';
import {
    getBuiltBindingIndex,
    getBuiltCollections,
} from 'src/utils/builtSpec-utils';

const { resolve_built_collections: actualResolve } =
    await vi.importActual<typeof FlowWeb>('@estuary/flow-web');

vi.mock('@estuary/flow-web', () => ({ resolve_built_collections: vi.fn() }));
vi.mock('src/services/shared', () => ({ logRocketEvent: vi.fn() }));

const resolve = vi.mocked(resolve_built_collections);

const orders = { name: 'acmeCo/orders', key: ['/id'] };
const users = { name: 'acmeCo/users', key: ['/id'] };

beforeEach(() => {
    resolve.mockReset();
});

describe('getBuiltCollections', () => {
    test('gives flow-web numbered stand-ins and returns the original collections', () => {
        const builtSpec = {
            bindings: [{ collectionIndex: 1 }, {}, { collectionIndex: 7 }],
            linkedCollections: [orders, users],
        };
        resolve.mockReturnValue({
            collections: [{ name: '0' }, { name: '1' }],
            bindings: [1, 0, null],
        });

        const resolved = getBuiltCollections(builtSpec);

        expect(resolve).toHaveBeenCalledWith({
            specType: 'materialization',
            builtSpec: {
                bindings: [
                    { collection: undefined, collectionIndex: 1 },
                    { collection: undefined, collectionIndex: undefined },
                    { collection: undefined, collectionIndex: 7 },
                ],
                linkedCollections: [{ name: '0' }, { name: '1' }],
            },
        });
        expect(resolved).toEqual([users, orders, undefined]);
        expect(resolved[0]).toBe(users);
    });

    test('replaces inline collections with stand-ins, in whatever order flow-web returns them', () => {
        const builtSpec = {
            bindings: [{ collection: orders }, { collection: users }],
        };
        resolve.mockReturnValue({
            collections: [{ name: '1' }, { name: '0' }],
            bindings: [1, 0],
        });

        expect(getBuiltCollections(builtSpec)).toEqual([orders, users]);
        expect(resolve).toHaveBeenCalledWith({
            specType: 'materialization',
            builtSpec: {
                bindings: [
                    { collection: { name: '0' }, collectionIndex: undefined },
                    { collection: { name: '1' }, collectionIndex: undefined },
                ],
                linkedCollections: undefined,
            },
        });
    });

    test('calls flow-web once for each built spec', () => {
        const builtSpec = { bindings: [{ collection: orders }] };
        resolve.mockReturnValue({
            collections: [{ name: '0' }],
            bindings: [0],
        });

        getBuiltCollections(builtSpec);
        getBuiltCollections(builtSpec);
        getBuiltBindingIndex(builtSpec, orders.name);
        expect(resolve).toHaveBeenCalledTimes(1);

        getBuiltCollections({ bindings: [{ collection: orders }] });
        expect(resolve).toHaveBeenCalledTimes(2);
    });

    test('returns nothing without a built spec', () => {
        expect(getBuiltCollections(null)).toEqual([]);
        expect(resolve).not.toHaveBeenCalled();
    });
});

describe('getBuiltCollections with flow-web', () => {
    // Two collections of one name, as bindings with different groupBy build.
    const byId = { name: 'acmeCo/orders', key: ['/id'] };
    const byCategory = { name: 'acmeCo/orders', key: ['/category'] };

    beforeEach(() => {
        resolve.mockImplementation(actualResolve);
    });

    test('resolves an indirect spec', () => {
        const builtSpec = {
            bindings: [
                {},
                { collectionIndex: 1 },
                { collectionIndex: 2 },
                { collectionIndex: 7 },
            ],
            linkedCollections: [users, byId, byCategory],
        };

        const resolved = getBuiltCollections(builtSpec);

        expect(resolved).toHaveLength(4);
        expect(resolved[0]).toBe(users);
        expect(resolved[1]).toBe(byId);
        expect(resolved[2]).toBe(byCategory);
        expect(resolved[3]).toBeUndefined();
    });

    test('resolves an inline spec', () => {
        const builtSpec = {
            bindings: [
                { collection: users },
                { collection: byCategory },
                {},
                { collection: byId },
                { collection: users },
            ],
        };

        const resolved = getBuiltCollections(builtSpec);

        expect(resolved).toHaveLength(5);
        expect(resolved[0]).toBe(users);
        expect(resolved[1]).toBe(byCategory);
        expect(resolved[2]).toBeUndefined();
        expect(resolved[3]).toBe(byId);
        expect(resolved[4]).toBe(users);
    });

    test('leaves the bindings of an unreadable spec unresolved, without retrying', () => {
        // flow-web rejects a non-numeric index; JS rejects non-array bindings.
        const badIndex = {
            bindings: [{ collectionIndex: 'one' }],
            linkedCollections: [users],
        };
        const badBindings = { bindings: { collection: users } };

        expect(getBuiltCollections(badIndex)).toEqual([]);
        expect(getBuiltCollections(badBindings)).toEqual([]);
        expect(getBuiltBindingIndex(badIndex, users.name)).toBe(-1);
        expect(resolve).toHaveBeenCalledTimes(1);
        expect(logRocketEvent).toHaveBeenCalledTimes(2);
    });
});

describe('getBuiltBindingIndex', () => {
    test('finds the first built binding of a collection', () => {
        const builtSpec = {
            bindings: [{}, {}, {}],
            linkedCollections: [orders, users],
        };
        resolve.mockReturnValue({
            collections: [{ name: '0' }, { name: '1' }],
            bindings: [null, 1, 1],
        });

        expect(getBuiltBindingIndex(builtSpec, users.name)).toBe(1);
        expect(getBuiltBindingIndex(builtSpec, orders.name)).toBe(-1);
    });
});
