import type { Meta, StoryObj } from '@storybook/react-vite';
import type { DataFlowGraph } from 'src/components/shared/Entity/Details/DataFlow/types';

import { MemoryRouter } from 'react-router-dom';

import { DataFlowView } from 'src/components/shared/Entity/Details/DataFlow/DataFlowView';
import {
    ALICE,
    CAROL,
    fixtureFetchers,
} from 'src/components/shared/Entity/Details/DataFlow/fixtures';
import {
    buildDataFlowGraph,
    walkDataFlow,
} from 'src/components/shared/Entity/Details/DataFlow/graph';

// The fixture tenant: acmeCo/shop-ingest captures orders + customers; five
// derivations (two transforms on one source, a join, a chain, a self-sourcing
// dedupe, and one with a disabled transform); two materializations, one
// disabled.
type Args = {
    centre: string;
    depth: number;
    viewer: 'alice' | 'carol';
};

const meta: Meta<Args> = {
    title: 'Details/DataFlow',
    decorators: [
        (Story: React.ComponentType) => (
            <MemoryRouter>
                <Story />
            </MemoryRouter>
        ),
    ],
    parameters: { layout: 'padded' },
    loaders: [
        async ({ args }: { args: Args }) => {
            const walk = await walkDataFlow(
                args.centre,
                args.depth,
                fixtureFetchers(args.viewer === 'carol' ? CAROL : ALICE)
            );

            return { graph: buildDataFlowGraph(walk) };
        },
    ],
    render: (args: Args, { loaded }: { loaded: { graph?: DataFlowGraph } }) => (
        <DataFlowView
            graph={loaded.graph as DataFlowGraph}
            depth={args.depth}
            onShowMore={() => undefined}
        />
    ),
};

export default meta;

type Story = StoryObj<Args>;

export const WholeTenant: Story = {
    args: { centre: 'acmeCo/orders', depth: 3, viewer: 'alice' },
};

export const Derivation: Story = {
    args: { centre: 'acmeCo/orders-enriched', depth: 3, viewer: 'alice' },
};

export const TwoTransformsOneSource: Story = {
    args: { centre: 'acmeCo/orders-split', depth: 3, viewer: 'alice' },
};

export const SelfSourcing: Story = {
    args: { centre: 'acmeCo/order-dedupe', depth: 3, viewer: 'alice' },
};

export const DisabledTransform: Story = {
    args: { centre: 'acmeCo/customer-totals', depth: 1, viewer: 'alice' },
};

export const DepthLimited: Story = {
    args: { centre: 'acmeCo/shop-ingest', depth: 1, viewer: 'alice' },
};

export const LockedSource: Story = {
    args: { centre: 'acmeCo/team/rollup', depth: 3, viewer: 'carol' },
};
