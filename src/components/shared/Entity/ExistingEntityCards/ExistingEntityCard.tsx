import { Box, Grid, Paper, Typography } from '@mui/material';
import {
    CaptureQuery,
    getLiveSpecsByConnectorId,
    MaterializationQuery,
} from 'api/liveSpecsExt';
import { authenticatedRoutes } from 'app/routes';
import ConnectorLogo from 'components/connectors/card/Logo';
import OptionsMenu from 'components/shared/Entity/ExistingEntityCards/OptionsMenu';
import {
    alternateConnectorImageBackgroundSx,
    semiTransparentBackground,
    semiTransparentBackgroundIntensified,
} from 'context/Theme';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { isEmpty } from 'lodash';
import { useEffect, useState } from 'react';
import { FormattedDate } from 'react-intl';
import { useNavigate } from 'react-router';
import { EntityWithCreateWorkflow } from 'types';
import { getPathWithParams } from 'utils/misc-utils';

interface Props {
    entityType: EntityWithCreateWorkflow;
    // query: CaptureQuery | MaterializationQuery;
}

const getExistingEntites = async (
    entityType: EntityWithCreateWorkflow,
    connectorId: string
) => {
    const response = await getLiveSpecsByConnectorId(entityType, connectorId);

    return response;
};

function ExistingEntityCard({ entityType }: Props) {
    const connectorId = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);

    const navigate = useNavigate();

    const [query, setQuery] = useState<
        CaptureQuery[] | MaterializationQuery[] | null
    >(null);

    const [selection, setSelection] = useState<
        CaptureQuery | MaterializationQuery | null
    >(null);
    const [detailsExpanded, setDetailsExpanded] = useState<boolean>(false);

    useEffect(() => {
        getExistingEntites(entityType, connectorId).then(
            (response) => {
                setQuery(response.data);
            },
            () => {
                setQuery(null);
            }
        );
    }, [setQuery, connectorId, entityType]);

    const handlers = {
        editTask: () => {
            if (!isEmpty(selection)) {
                navigate(
                    getPathWithParams(
                        authenticatedRoutes.captures.edit.fullPath,
                        {
                            [GlobalSearchParams.CONNECTOR_ID]:
                                selection.connector_id,
                            [GlobalSearchParams.LIVE_SPEC_ID]: selection.id,
                            [GlobalSearchParams.LAST_PUB_ID]:
                                selection.last_pub_id,
                        }
                    )
                );
            }
            setSelection(null);
        },
        toggleDetailsPanel: () => setDetailsExpanded(!detailsExpanded),
    };

    return query && query.length > 0 ? (
        <Grid container spacing={{ xs: 2, md: 3 }}>
            {query.map((data, index) => (
                <Grid key={`existing-entity-card-${index}`} item xs={12}>
                    <Paper
                        sx={{
                            'borderRadius': 5,
                            'background': (theme) =>
                                semiTransparentBackground[theme.palette.mode],
                            'padding': 1,
                            '&:hover': {
                                background: (theme) =>
                                    semiTransparentBackgroundIntensified[
                                        theme.palette.mode
                                    ],
                            },
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexGrow: 1,
                                }}
                            >
                                <Box sx={alternateConnectorImageBackgroundSx}>
                                    <ConnectorLogo
                                        imageSrc={data.image}
                                        maxHeight={50}
                                    />
                                </Box>

                                <Box sx={{ ml: 2 }}>
                                    <Typography
                                        variant="h6"
                                        sx={{ width: 'max-content' }}
                                    >
                                        {data.catalog_name}
                                    </Typography>

                                    <FormattedDate
                                        day="numeric"
                                        month="long"
                                        year="numeric"
                                        value={data.updated_at}
                                    />
                                </Box>
                            </Box>

                            <OptionsMenu
                                detailsExpanded={detailsExpanded}
                                toggleDetailsPanel={handlers.toggleDetailsPanel}
                                editTask={handlers.editTask}
                            />
                        </Box>
                    </Paper>
                </Grid>
            ))}
        </Grid>
    ) : null;
}

export default ExistingEntityCard;
