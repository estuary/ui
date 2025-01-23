/* eslint-disable complexity */
import { Button, Stack, Typography } from '@mui/material';
import ListView from 'components/collection/DataPreview/ListView';
import { useEditorStore_specs } from 'components/editor/Store/hooks';
import JournalAlerts from 'components/journals/Alerts';
import AlertBox from 'components/shared/AlertBox';
import CardWrapper from 'components/shared/CardWrapper';
import useIsCollectionDerivation from 'components/shared/Entity/Details/useIsCollectionDerivation';
import Error from 'components/shared/Error';
import {
    useJournalData,
    useJournalsForCollection,
} from 'hooks/journals/useJournalData';
import { LiveSpecsQuery_details } from 'hooks/useLiveSpecs';
import { useTenantHidesDataPreview } from 'hooks/useTenants';
import { Refresh } from 'iconoir-react';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { BASE_ERROR } from 'services/supabase';
import { hasLength } from 'utils/misc-utils';
import ListViewSkeleton from './ListViewSkeleton';
import NoCollectionJournalsAlert from './NoCollectionJournalsAlert';

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

    const isDerivation = useIsCollectionDerivation();

    const { error: tenantHidesError, hide } =
        useTenantHidesDataPreview(collectionName);

    const editorSpecs = useEditorStore_specs<LiveSpecsQuery_details>({
        localScope: true,
    });

    const spec = useMemo(
        () => (editorSpecs && hasLength(editorSpecs) ? editorSpecs[0] : null),
        [editorSpecs]
    );

    const journals = useJournalsForCollection(spec?.catalog_name);

    const {
        data: journalsData,
        isValidating: journalsLoading,
        error: journalsError,
    } = journals;

    // TODO (typing) we need to fix typing
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const journal = useMemo(() => journalsData?.journals[0], [journalsData]);
    const journalData = useJournalData(journal?.spec?.name, {
        desiredCount: 20,
    });

    const readError = journalData.error
        ? {
              ...BASE_ERROR,
              message: journalData.error.message,
          }
        : journalsError;

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
                        disabled={Boolean(
                            isLoading ||
                                !hasLength(journalData.data?.documents) ||
                                hide
                        )}
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
                {!hide ? (
                    <JournalAlerts
                        journalData={journalData}
                        journalsData={journalsData}
                        notFoundTitleMessage={
                            isDerivation ? (
                                'collectionsPreview.notFound.message.derivation'
                            ) : (
                                <NoCollectionJournalsAlert />
                            )
                        }
                    />
                ) : null}

                {tenantHidesError || hide ? (
                    <AlertBox short severity="info">
                        <FormattedMessage id="detailsPanel.dataPreview.hidden" />
                    </AlertBox>
                ) : readError ? (
                    <Error error={readError} condensed />
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
