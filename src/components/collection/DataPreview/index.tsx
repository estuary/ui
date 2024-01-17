/* eslint-disable complexity */
import { Button, Stack, Typography } from '@mui/material';
import CardWrapper from 'components/admin/Billing/CardWrapper';
import ListView from 'components/collection/DataPreview/ListView';
import JournalAlerts from 'components/journals/Alerts';
import Error from 'components/shared/Error';
import {
    useJournalData,
    useJournalsForCollection,
} from 'hooks/journals/useJournalData';
import { LiveSpecsQuery_spec, useLiveSpecs_spec } from 'hooks/useLiveSpecs';
import { Refresh } from 'iconoir-react';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { hasLength } from 'utils/misc-utils';
import ListViewSkeleton from './ListViewSkeleton';

interface Props {
    collectionName: string;
}

// TODO (preview table) the table view has some issues so turning off before enabling it
//      in production. Mainly that we should use projections to fetch data.

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

    const {
        data: journalsData,
        isValidating: journalsLoading,
        error: journalsError,
    } = journals;

    // TODO (typing) we need to fix typing
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const journal = useMemo(() => journalsData?.journals?.[0], [journalsData]);
    const journalData = useJournalData(journal?.name, 20, collectionName);

    // There is a brief delay between when the data preview card is rendered and the two journal-related
    // hooks are called, which resulted in `isLoading` being a false negative. If the journal client is
    // `null` or the collection name undefined, `journalsData` will be `null` and this component will be
    // stuck in a loading state. Ideally, this condition would specifically check whether `journalsData`
    // is undefined; however it is possible for the variable to quickly switch from undefined to `null`
    // then back to undefined while loading, resulting in a pseudo-inversion of the original problem.
    const isLoading = journalsLoading || !journalsData || journalData.loading;

    return (
        <CardWrapper
            message={
                <Stack
                    direction="row"
                    spacing={2}
                    sx={{ alignItems: 'center' }}
                >
                    <Typography component="span">
                        <FormattedMessage id="detailsPanel.dataPreview.header" />
                    </Typography>

                    <Button
                        variant="text"
                        startIcon={<Refresh style={{ fontSize: 12 }} />}
                        onClick={() => journalData.refresh()}
                        disabled={
                            isLoading || !hasLength(journalData.data?.documents)
                        }
                        sx={{
                            height: 'auto',
                        }}
                    >
                        <FormattedMessage id="cta.refresh" />
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
            }
        >
            <>
                <JournalAlerts
                    journalData={journalData}
                    journalsData={journalsData}
                    notFoundTitleMessage="collectionsPreview.notFound.message"
                />

                {journalsError ? (
                    <Error error={journalsError} condensed />
                ) : isLoading ? (
                    <ListViewSkeleton />
                ) : (journalData.data?.documents.length ?? 0) > 0 && spec ? (
                    <ListView journalData={journalData} spec={spec} />
                ) : null}

                {/*             : (
                <TableView journalData={journalData} spec={spec} />
            )}*/}
            </>
        </CardWrapper>
    );
}
