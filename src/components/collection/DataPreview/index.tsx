import RefreshIcon from '@mui/icons-material/Refresh';
import { LoadingButton } from '@mui/lab';
import {
    Alert,
    AlertTitle,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material';
import ListView from 'components/collection/DataPreview/ListView';
import TableView from 'components/collection/DataPreview/TableView';
import { useJournalData, useJournalsForCollection } from 'hooks/useJournalData';
import { useLiveSpecs_spec } from 'hooks/useLiveSpecs';
import { useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { hasLength } from 'utils/misc-utils';

interface Props {
    collectionName: string;
}

enum Views {
    table = 'table',
    list = 'list',
}

export function DataPreview({ collectionName }: Props) {
    const [previewMode, setPreviewMode] = useState<Views>(Views.list);
    const toggleMode = (_event: any, newValue: Views) => {
        setPreviewMode(newValue);
    };

    const { liveSpecs: publicationSpecs } = useLiveSpecs_spec(
        `datapreview-${collectionName}`,
        [collectionName]
    );
    const spec = useMemo(() => publicationSpecs[0], [publicationSpecs]);

    // TODO (typing) we need to fix typing
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const journals = useJournalsForCollection(spec?.catalog_name);
    const { data: journalsData, isValidating: journalsLoading } = journals;

    // TODO (typing) we need to fix typing
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const journal = useMemo(() => journalsData?.journals?.[0], [journalsData]);
    const journalData = useJournalData(journal?.name, 20);
    const isLoading = journalsLoading || journalData.loading;

    return (
        <>
            <Stack
                justifyContent="space-between"
                direction="row"
                spacing={2}
                sx={{ mb: 1 }}
            >
                <Stack
                    direction="row"
                    spacing={2}
                    sx={{ alignItems: 'center' }}
                >
                    <Typography variant="subtitle1">
                        <FormattedMessage id="detailsPanel.dataPreview.header" />
                    </Typography>

                    <LoadingButton
                        variant="text"
                        startIcon={<RefreshIcon />}
                        onClick={journalData.refresh}
                        loading={
                            !hasLength(journalData.data?.documents) || isLoading
                        }
                        sx={{
                            height: 'auto',
                        }}
                    >
                        <FormattedMessage id="cta.refresh" />
                    </LoadingButton>
                </Stack>

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
            </Stack>

            {!hasLength(journalsData?.journals) ? (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    <AlertTitle>
                        <FormattedMessage id="collectionsPreview.notFound.title" />
                    </AlertTitle>
                    <FormattedMessage id="collectionsPreview.notFound.message" />
                </Alert>
            ) : journalData.data?.tooManyBytes &&
              journalData.data.documents.length === 0 ? (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    <AlertTitle>
                        <FormattedMessage id="collectionsPreview.tooManyBytesAndNoDocuments.title" />
                    </AlertTitle>
                    <FormattedMessage id="collectionsPreview.tooManyBytesAndNoDocuments.message" />
                </Alert>
            ) : journalData.data?.tooFewDocuments ? (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    <AlertTitle>
                        <FormattedMessage id="collectionsPreview.tooFewDocuments.title" />
                    </AlertTitle>
                    <FormattedMessage id="collectionsPreview.tooFewDocuments.message" />
                </Alert>
            ) : journalData.data?.tooManyBytes ? (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    <AlertTitle>
                        <FormattedMessage id="collectionsPreview.tooManyBytes.title" />
                    </AlertTitle>
                    <FormattedMessage id="collectionsPreview.tooManyBytes.message" />
                </Alert>
            ) : previewMode === Views.list ? (
                <ListView journalData={journalData} spec={spec} />
            ) : (
                <TableView journalData={journalData} spec={spec} />
            )}
        </>
    );
}
