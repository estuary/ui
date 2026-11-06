import type { Meta, StoryObj } from '@storybook/react-vite';
import type { useJournalData } from 'src/hooks/journals/useJournalData';
import type { LiveSpecsQuery_details } from 'src/hooks/useLiveSpecs';

import { useMemo, useState } from 'react';

import { IntlProvider } from 'react-intl';

import { DataPreviewHeader } from 'src/components/collection/DataPreview/Header';
import ListView from 'src/components/collection/DataPreview/ListView';
import ListViewSkeleton from 'src/components/collection/DataPreview/ListViewSkeleton';
import CardWrapper from 'src/components/shared/CardWrapper';
import enUSMessages from 'src/lang/en-US';

const KEY_POINTERS = ['/Id'];

// Only the field `ListView` reads to build each row's key.
const SPEC = {
    spec: { key: KEY_POINTERS },
} as unknown as LiveSpecsQuery_details;

// Documents cycle through `keyCount` keys, the way repeated updates to the same
// records land in a journal.
const buildJournalData = (
    documentCount: number,
    keyCount: number
): ReturnType<typeof useJournalData> => ({
    data: {
        documents: Array.from({ length: documentCount }, (_, index) => ({
            _meta: {
                uuid: `${String(index).padStart(8, '0')}-0000-1000-8000-000000000000`,
            },
            Id: `00O5e00000${String(index % keyCount).padStart(3, '0')}AbcEAQ`,
            Name: `Pipeline by region ${index}`,
            LastModifiedDate: '2026-10-30T14:02:11.000Z',
        })),
        tooManyBytes: false,
    },
    error: null,
    loading: false,
    refresh: () => {},
});

interface HarnessProps {
    documentCount: number;
    keyCount: number;
}

/**
 * The Data Preview card, assembled from the same header and list `DataPreview`
 * renders, without its journal fetching. Refresh shows the loading state for a
 * second.
 */
function DataPreviewHarness({ documentCount, keyCount }: HarnessProps) {
    const [loading, setLoading] = useState(false);

    const journalData = useMemo(
        () => buildJournalData(documentCount, keyCount),
        [documentCount, keyCount]
    );

    return (
        <CardWrapper
            message={
                <DataPreviewHeader
                    documents={journalData.data?.documents}
                    keyPointers={KEY_POINTERS}
                    onRefresh={() => {
                        setLoading(true);
                        setTimeout(() => setLoading(false), 1000);
                    }}
                    refreshDisabled={loading}
                    showNotice
                />
            }
        >
            {loading ? (
                <ListViewSkeleton />
            ) : (
                <ListView journalData={journalData} spec={SPEC} />
            )}
        </CardWrapper>
    );
}

const meta: Meta<typeof DataPreviewHarness> = {
    title: 'Collection/DataPreview',
    component: DataPreviewHarness,
    decorators: [
        // `CardWrapper` still reads react-intl for its optional tooltip.
        (Story: React.ComponentType) => (
            <IntlProvider locale="en" messages={enUSMessages}>
                <Story />
            </IntlProvider>
        ),
    ],
    parameters: { layout: 'padded' },
};

export default meta;

type Story = StoryObj<typeof DataPreviewHarness>;

/** The last 20 documents are all different records. */
export const Default: Story = {
    args: { documentCount: 20, keyCount: 20 },
};

/**
 * The last 20 documents are repeated updates to 4 records, so only 4 rows
 * show. Every other record is still in the collection.
 */
export const RepeatedUpdates: Story = {
    args: { documentCount: 20, keyCount: 4 },
};
