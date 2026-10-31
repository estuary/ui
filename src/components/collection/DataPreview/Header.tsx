import type { JournalRecord } from 'src/hooks/journals/types';

import { useMemo } from 'react';

import { Button, Stack, Typography } from '@mui/material';

import { Refresh } from 'iconoir-react';

import { buildRecordKey } from 'src/components/collection/DataPreview/shared';
import ExternalLink from 'src/components/shared/ExternalLink';

const VIEWING_DOCUMENTS_DOCS_URL =
    'https://docs.estuary.dev/concepts/collections/#viewing-collection-documents';

// What the sample is made of. The list shows the latest version of each key
// among the last few documents written to one partition, so it can have far
// fewer rows than documents read.
const describeSample = (keyCount: number, documentCount: number) => {
    const lastDocuments =
        documentCount === 1
            ? 'last document'
            : `last ${documentCount} documents`;

    return keyCount < documentCount
        ? `${keyCount} ${keyCount === 1 ? 'key' : 'keys'} from the ${lastDocuments}`
        : `${lastDocuments.charAt(0).toUpperCase()}${lastDocuments.slice(1)}`;
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
    const keyCount = useMemo(
        () =>
            documents && keyPointers
                ? new Set(
                      documents.map((record) =>
                          buildRecordKey(keyPointers, record)
                      )
                  ).size
                : 0,
        [documents, keyPointers]
    );

    const showSample = Boolean(documents) && keyCount > 0;

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

                    {/*
                    <ToggleButtonGroup
                        color="primary"
                        size="small"
                        exclusive
                        onChange={toggleMode}
                        value={previewMode}
                        disabled={!hasLength(journalData.data?.documents)}
                    >
                        <ToggleButton value={Views.list}>
                            <FormattedMessage id="cta.list" />
                        </ToggleButton>
                        <ToggleButton value={Views.table}>
                            <FormattedMessage id="cta.table" />
                        </ToggleButton>
                    </ToggleButtonGroup>
                    */}
                </Stack>

                {documents && showSample ? (
                    <Typography
                        component="div"
                        variant="cardCaption"
                        sx={{ color: 'text.diminished' }}
                    >
                        {describeSample(keyCount, documents.length)}
                    </Typography>
                ) : null}
            </Stack>

            {/*
              A record missing from the sample may still be in the collection;
              a customer once took that as data loss.
            */}
            {showSample ? (
                <Typography
                    component="div"
                    variant="cardCaption"
                    sx={{ color: 'text.diminished' }}
                >
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
