import { Add } from '@mui/icons-material';
import { Box, ButtonBase, Grid, Typography } from '@mui/material';
import {
    CaptureQueryWithSpec,
    getLiveSpecsByConnectorId,
    MaterializationQueryWithSpec,
} from 'api/liveSpecsExt';
import ExistingEntityCard from 'components/shared/Entity/ExistingEntityCards/Card';
import {
    alternateConnectorImageBackgroundSx,
    semiTransparentBackground,
    semiTransparentBackgroundIntensified,
} from 'context/Theme';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { EntityWithCreateWorkflow } from 'types';

interface Props {
    entityType: EntityWithCreateWorkflow;
    setCreateNewTask: Dispatch<SetStateAction<boolean>>;
}

const getExistingEntities = async (
    entityType: EntityWithCreateWorkflow,
    connectorId: string
) => {
    const response = await getLiveSpecsByConnectorId(entityType, connectorId);

    return response;
};

function ExistingEntityCards({ entityType, setCreateNewTask }: Props) {
    const connectorId = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);

    const [query, setQuery] = useState<
        CaptureQueryWithSpec[] | MaterializationQueryWithSpec[] | null
    >(null);

    useEffect(() => {
        getExistingEntities(entityType, connectorId).then(
            (response) => {
                setQuery(response.data);
            },
            () => {
                setQuery(null);
            }
        );
    }, [setQuery, connectorId, entityType]);

    return (
        <Grid container spacing={{ xs: 2, md: 3 }}>
            {query && query.length > 0
                ? query.map((data, index) => (
                      <Grid key={`existing-entity-card-${index}`} item xs={12}>
                          <ExistingEntityCard queryData={data} />
                      </Grid>
                  ))
                : null}

            <Grid item xs={12}>
                <ButtonBase
                    onClick={() => setCreateNewTask(true)}
                    sx={{
                        'width': '100%',
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
                            flexGrow: 1,
                        }}
                    >
                        <Box
                            sx={{
                                ...alternateConnectorImageBackgroundSx,
                                width: 80,
                            }}
                        >
                            <Add />
                        </Box>

                        <Box sx={{ ml: 2 }}>
                            <Typography
                                variant="h6"
                                sx={{ width: 'max-content' }}
                            >
                                Create new
                            </Typography>
                        </Box>
                    </Box>
                </ButtonBase>
            </Grid>
        </Grid>
    );
}

export default ExistingEntityCards;
