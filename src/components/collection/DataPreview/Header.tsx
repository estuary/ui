import type { JournalRecord } from 'src/hooks/journals/types';

import { useMemo } from 'react';

import { Button, Stack, Typography } from '@mui/material';

import { Refresh } from 'iconoir-react';

import { getLatestDocumentByKey } from 'src/components/collection/DataPreview/shared';
import ExternalLink from 'src/components/shared/ExternalLink';

const VIEWING_DOCUMENTS_DOCS_URL =
    'https://docs.estuary.dev/concepts/collections/#viewing-collection-documents';

// What the sample is made of. The list shows the latest version of each key
// among the last few documents written to one partition, so it can have far
// fewer rows than documents read.
const describeSample = (keyCount: number, documentCount: number) => {
    const documents =
        documentCount === 1 ? 'document' : `${documentCount} documents`;

    return keyCount < documentCount
        ? `${keyCount} ${keyCount === 1 ? 'key' : 'keys'} from the last ${documents}`
        : `Last ${documents}`;
};

interface Props {
    onRefresh: () => void;
    refreshDisabled: boolean;
    // The documents listed below. The sample notice and counts describe them,
    // so they are left out while documents load or when there are none.
    documents?: JournalRecord[];
    keyPointers?: string[];
}

export function DataPreviewHeader({
    documents,
    keyPointers,
    onRefresh,
    refreshDisabled,
}: Props) {
    const sampleDescription = useMemo(
        () =>
            documents?.length && keyPointers
                ? describeSample(
                      Object.keys(
                          getLatestDocumentByKey(keyPointers, documents)
                      ).length,
                      documents.length
                  )
                : null,
        [documents, keyPointers]
    );

    return (
        <Stack spacing={0.5}>
            <Stack
                direction="row"
                spacing={1}
                sx={{
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    width: '100%',
                }}
            >
                <Stack
                    direction="row"
                    spacing={2}
                    sx={{ alignItems: 'center' }}
                >
                    <Typography component="span" variant="cardTitle">
                        Data Preview
                    </Typography>

                    <Button
                        variant="text"
                        // Iconoir draws within ~5/6 of its box, so 12px puts
                        // the glyph at the label's 10px cap height.
                        startIcon={<Refresh height={12} width={12} />}
                        onClick={onRefresh}
                        disabled={refreshDisabled}
                        // No vertical padding, so the button is no taller
                        // than the title and the card's top padding stays even
                        // with its sides.
                        sx={{
                            height: 'auto',
                            py: 0,
                        }}
                    >
                        Refresh
                    </Button>
                </Stack>

                {sampleDescription ? (
                    <Typography component="div" variant="cardCaption">
                        {sampleDescription}
                    </Typography>
                ) : null}
            </Stack>

            {/*
              A record missing from the sample may still be in the collection;
              a customer once took that as data loss.
            */}
            {sampleDescription ? (
                <Typography component="div" variant="cardCaption">
                    Showing a sample of recent documents, not the full
                    collection.{' '}
                    <ExternalLink link={VIEWING_DOCUMENTS_DOCS_URL}>
                        Read all documents with flowctl
                    </ExternalLink>
                </Typography>
            ) : null}
        </Stack>
    );
}
