import { Add } from '@mui/icons-material';
import { Box, ButtonBase, Grid, Typography } from '@mui/material';
import ExistingEntityCard from 'components/shared/Entity/ExistingEntityCards/Card';
import {
    useExistingEntity_queryData,
    useExistingEntity_setCreateNewTask,
} from 'components/shared/Entity/ExistingEntityCards/Store/hooks';
import {
    alternateConnectorImageBackgroundSx,
    semiTransparentBackground,
    semiTransparentBackgroundIntensified,
} from 'context/Theme';

function ExistingEntityCards() {
    // Existing Entity Store
    const queryData = useExistingEntity_queryData();

    const setCreateNewTask = useExistingEntity_setCreateNewTask();

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Grid container spacing={{ xs: 2 }} sx={{ maxWidth: 1500 }}>
                {queryData && queryData.length > 0
                    ? queryData.map((data, index) => (
                          <Grid
                              key={`existing-entity-card-${index}`}
                              item
                              xs={12}
                          >
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
                                <Typography sx={{ width: 'max-content' }}>
                                    Create new
                                </Typography>
                            </Box>
                        </Box>
                    </ButtonBase>
                </Grid>
            </Grid>
        </Box>
    );
}

export default ExistingEntityCards;
