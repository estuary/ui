import RefreshIcon from '@mui/icons-material/Refresh';
import { LoadingButton } from '@mui/lab';
import { AlertTitle, Box, Stack, Typography } from '@mui/material';
import ListView from 'components/collection/DataPreview/ListView';
import AlertBox from 'components/shared/AlertBox';
import { useJournalData, useJournalsForCollection } from 'hooks/useJournalData';
import { LiveSpecsQuery_spec, useLiveSpecs_spec } from 'hooks/useLiveSpecs';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { hasLength } from 'utils/misc-utils';

interface Props {
    collectionName: string;
}

// TODO (preview table) the table view has some issues so turning off before enabling it
//      in production. Mainly that we should use projecttions to fetch data.

// enum Views {
//     table = 'table',
//     list = 'list',
// }

export function DataPreview({ collectionName }: Props) {
    // const [previewMode, setPreviewMode] = useState<Views>(Views.list);
    // const toggleMode = (_event: any, newValue: Views) => {
    //     setPreviewMode(newValue);
    // };

    const { liveSpecs: publicationSpecs } = useLiveSpecs_spec(
        `datapreview-${collectionName}`,
        [collectionName]
    );
    const spec = useMemo(
        () => publicationSpecs[0] as LiveSpecsQuery_spec | undefined,
        [publicationSpecs]
    );

    const journals = useJournalsForCollection(spec?.catalog_name);
    const { data: journalsData, isValidating: journalsLoading } = journals;

    // TODO (typing) we need to fix typing
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const journal = useMemo(() => journalsData?.journals?.[0], [journalsData]);
    const journalData = useJournalData(journal?.name, 20, collectionName);
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
                        disabled={!hasLength(journalData.data?.documents)}
                        loading={isLoading}
                        sx={{
                            height: 'auto',
                        }}
                    >
                        <FormattedMessage id="cta.refresh" />
                    </LoadingButton>
                </Stack>

                {/*                <ToggleButtonGroup
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
                </ToggleButtonGroup>*/}
            </Stack>

            {!hasLength(journalsData?.journals) ? (
                <Box sx={{ mb: 3 }}>
                    <AlertBox severity="warning">
                        <AlertTitle>
                            <FormattedMessage id="collectionsPreview.notFound.title" />
                        </AlertTitle>
                        <FormattedMessage id="collectionsPreview.notFound.message" />
                    </AlertBox>
                </Box>
            ) : journalData.data?.tooManyBytes &&
              journalData.data.documents.length === 0 ? (
                <Box sx={{ mb: 3 }}>
                    <AlertBox severity="warning">
                        <AlertTitle>
                            <FormattedMessage id="collectionsPreview.tooManyBytesAndNoDocuments.title" />
                        </AlertTitle>
                        <FormattedMessage id="collectionsPreview.tooManyBytesAndNoDocuments.message" />
                    </AlertBox>
                </Box>
            ) : journalData.data?.tooFewDocuments ? (
                <Box sx={{ mb: 3 }}>
                    <AlertBox severity="warning">
                        <AlertTitle>
                            <FormattedMessage id="collectionsPreview.tooFewDocuments.title" />
                        </AlertTitle>
                        <FormattedMessage id="collectionsPreview.tooFewDocuments.message" />
                    </AlertBox>
                </Box>
            ) : journalData.data?.tooManyBytes ? (
                <Box sx={{ mb: 3 }}>
                    <AlertBox severity="warning">
                        <AlertTitle>
                            <FormattedMessage id="collectionsPreview.tooManyBytes.title" />
                        </AlertTitle>
                        <FormattedMessage id="collectionsPreview.tooManyBytes.message" />
                    </AlertBox>
                </Box>
            ) : null}
            {(journalData.data?.documents.length ?? 0) > 0 && spec ? (
                <ListView journalData={journalData} spec={spec} />
            ) : null}
            {/*             : (
                <TableView journalData={journalData} spec={spec} />
            )}*/}
        </>
    );
}
