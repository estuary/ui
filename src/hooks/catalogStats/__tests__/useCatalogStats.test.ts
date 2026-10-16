import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { usePollingQuery } from 'src/api/gql/usePollingQuery';
import { DataGrains } from 'src/components/graphs/types';
import { useCatalogStats } from 'src/hooks/catalogStats/useCatalogStats';

vi.mock('src/api/gql/usePollingQuery', () => ({
    usePollingQuery: vi.fn(),
}));

const mockedUsePollingQuery = vi.mocked(usePollingQuery);

const RANGE = { grain: DataGrains.hourly, amount: 3 };

describe('useCatalogStats', () => {
    test('queries each catalog name once, ignoring blanks and duplicates', () => {
        mockedUsePollingQuery.mockReturnValue({
            data: { catalogStats: { edges: [] } },
            fetching: false,
            error: undefined,
            updatedAt: null,
        });

        const catalogNames = ['acmeCo/a', '', 'acmeCo/a', 'acmeCo/b'];
        const { result } = renderHook(() =>
            useCatalogStats(catalogNames, RANGE)
        );

        const [{ variables }] = mockedUsePollingQuery.mock.calls[0];
        expect(variables?.by.names).toEqual(['acmeCo/a', 'acmeCo/b']);

        // One record per hour in the range, not one per duplicate
        expect(Object.keys(result.current.data)).toEqual([
            'acmeCo/a',
            'acmeCo/b',
        ]);
        expect(result.current.data['acmeCo/a']).toHaveLength(RANGE.amount);
    });
});
