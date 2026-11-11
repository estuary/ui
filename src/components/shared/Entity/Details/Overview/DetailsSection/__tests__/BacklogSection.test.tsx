import type { MaterializationBacklog } from 'src/hooks/details/shared';

import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { BacklogSection } from 'src/components/shared/Entity/Details/Overview/DetailsSection/BacklogSection';

import '@testing-library/jest-dom/vitest';

const backlogOf = (bytesBehind: number): MaterializationBacklog => ({
    bindings: [{ collectionName: 'acmeCo/orders', bytesBehind }],
    bytesBehind,
    timestamp: 0,
});

describe('BacklogSection', () => {
    test('shows "current" when the bindings report zero bytes behind', () => {
        render(<BacklogSection backlog={backlogOf(0)} />);

        expect(screen.getByText('current')).toBeInTheDocument();
    });

    // e.g. a task re-enabled after a long pause, which hasn't reported yet
    test('shows a dash when there is no reading', () => {
        render(<BacklogSection backlog={null} />);

        expect(screen.getByText('—')).toBeInTheDocument();
        expect(screen.queryByText('current')).not.toBeInTheDocument();
    });

    test('shows a dash when the stats request failed', () => {
        render(<BacklogSection backlog={backlogOf(0)} error />);

        expect(screen.getByText('—')).toBeInTheDocument();
    });

    test('shows the bytes behind', () => {
        render(<BacklogSection backlog={backlogOf(220388)} />);

        expect(screen.getByText('220.39 kB')).toBeInTheDocument();
    });
});
