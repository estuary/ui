import { pathToTree } from 'src/utils/tree-utils';

describe('pathToTree', () => {
    test('returns empty array for empty input', () => {
        expect(pathToTree([])).toEqual([]);
    });

    test('builds a single-level node from a single-segment path', () => {
        const result = pathToTree(['acme']);
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('acme');
        expect(result[0].fullPath).toBe('acme');
        expect(result[0].children).toHaveLength(0);
    });

    test('builds a nested tree from a slash-delimited path', () => {
        const result = pathToTree(['acme/captures/my-capture']);
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('acme');
        expect(result[0].children).toHaveLength(1);
        expect(result[0].children[0].name).toBe('captures');
        expect(result[0].children[0].children).toHaveLength(1);
        expect(result[0].children[0].children[0].name).toBe('my-capture');
    });

    test('shares a common parent node for sibling paths', () => {
        const result = pathToTree(['acme/foo', 'acme/bar']);
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('acme');
        expect(result[0].children).toHaveLength(2);
        const names = result[0].children.map((c) => c.name);
        expect(names).toContain('foo');
        expect(names).toContain('bar');
    });

    test('creates separate root nodes for different top-level segments', () => {
        const result = pathToTree(['acme/foo', 'other/bar']);
        expect(result).toHaveLength(2);
        const roots = result.map((n) => n.name);
        expect(roots).toContain('acme');
        expect(roots).toContain('other');
    });

    test('does not duplicate a node when the same path appears twice', () => {
        const result = pathToTree(['acme/foo', 'acme/foo']);
        expect(result).toHaveLength(1);
        expect(result[0].children).toHaveLength(1);
    });

    test('stores the original full path on every node', () => {
        const result = pathToTree(['acme/captures/my-capture']);
        expect(result[0].fullPath).toBe('acme/captures/my-capture');
        expect(result[0].children[0].fullPath).toBe('acme/captures/my-capture');
    });
});
