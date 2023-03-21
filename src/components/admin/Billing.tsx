import {
    Autocomplete,
    AutocompleteRenderInputParams,
    Box,
    Grid,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import { authenticatedRoutes } from 'app/routes';
import AdminTabs from 'components/admin/Tabs';
import PageContainer from 'components/shared/PageContainer';
import useProjectCostStats from 'components/tables/Billing/useProjectedCostStats';
import {
    semiTransparentBackground,
    semiTransparentBackgroundIntensified,
} from 'context/Theme';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useBilling_setProjectedCostStats } from 'stores/Tables/Billing/hooks';
import useConstant from 'use-constant';

const boxShadow =
    'rgb(50 50 93 / 7%) 0px 3px 6px -1px, rgb(0 0 0 / 10%) 0px -2px 4px -1px, rgb(0 0 0 / 10%) 0px 2px 4px -1px';

const typographySx = { mb: 2, fontSize: 16, fontWeight: 300 };

const columns = [
    {
        field: 'month',
        headerIntlKey: 'admin.billing.projectedCostTable.label.month',
    },
    {
        field: 'data_volume',
        headerIntlKey: 'admin.billing.projectedCostTable.label.dataVolume',
    },
    {
        field: 'task_count',
        headerIntlKey: 'admin.billing.projectedCostTable.label.tasks',
    },
    {
        field: 'details',
        headerIntlKey: 'admin.billing.projectedCostTable.label.details',
    },
    {
        field: 'total_cost',
        headerIntlKey: 'admin.billing.projectedCostTable.label.totalCost',
    },
];

function AdminBilling() {
    useBrowserTitle('browserTitle.admin.billing');

    const intl = useIntl();

    const pricingTiers = useConstant(() => [
        intl.formatMessage({ id: 'admin.billing.tier.free' }),
        intl.formatMessage({ id: 'admin.billing.tier.personal' }),
        intl.formatMessage({ id: 'admin.billing.tier.enterprise' }),
    ]);

    // Billing Store
    const setProjectedCostStats = useBilling_setProjectedCostStats();

    const { projectedCostStats } = useProjectCostStats({});

    useEffect(() => {
        setProjectedCostStats(projectedCostStats);
    }, [setProjectedCostStats, projectedCostStats]);

    return (
        <PageContainer
            pageTitleProps={{
                header: authenticatedRoutes.admin.billing.title,
                headerLink: 'https://www.estuary.dev/pricing/',
            }}
        >
            <AdminTabs />

            <Grid container spacing={{ xs: 3, md: 2 }} sx={{ p: 2 }}>
                <Grid item xs={12} md={9}>
                    <Stack>
                        <Typography variant="h6" sx={{ mb: 0.5 }}>
                            <FormattedMessage id="admin.billing.header" />
                        </Typography>

                        <Typography>
                            <FormattedMessage id="admin.billing.message" />
                        </Typography>
                    </Stack>
                </Grid>

                <Grid
                    item
                    xs={12}
                    md={3}
                    sx={{ display: 'flex', alignItems: 'end' }}
                >
                    <Autocomplete
                        options={pricingTiers}
                        renderInput={({
                            InputProps,
                            ...params
                        }: AutocompleteRenderInputParams) => (
                            <TextField
                                {...params}
                                InputProps={{
                                    ...InputProps,
                                    sx: { borderRadius: 3 },
                                }}
                                label={intl.formatMessage({
                                    id: 'admin.billing.label.tiers',
                                })}
                                variant="outlined"
                                size="small"
                            />
                        )}
                        defaultValue={intl.formatMessage({
                            id: 'admin.billing.tier.free',
                        })}
                        disableClearable
                        sx={{ flexGrow: 1 }}
                        // onChange={changeHandler}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={{ xs: 3, md: 2 }} sx={{ p: 2 }}>
                <Grid item xs={12} md={6}>
                    <Box
                        sx={{
                            'height': 250,
                            'p': 2,
                            'background': (theme) =>
                                semiTransparentBackground[theme.palette.mode],
                            boxShadow,
                            'borderRadius': 3,
                            '&:hover': {
                                background: (theme) =>
                                    semiTransparentBackgroundIntensified[
                                        theme.palette.mode
                                    ],
                                boxShadow,
                            },
                        }}
                    >
                        <Typography sx={typographySx}>
                            <FormattedMessage id="admin.billing.projectedCostTable.header" />
                        </Typography>

                        <TableContainer component={Box}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        {columns.map((column, index) => (
                                            <TableCell
                                                key={`${column.field}-${index}`}
                                            >
                                                <FormattedMessage
                                                    id={column.headerIntlKey}
                                                />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    <TableRow hover>
                                        <TableCell>
                                            <span>Filler</span>
                                        </TableCell>

                                        <TableCell>
                                            <span>Filler</span>
                                        </TableCell>

                                        <TableCell>
                                            <span>Filler</span>
                                        </TableCell>

                                        <TableCell>
                                            <span>Filler</span>
                                        </TableCell>

                                        <TableCell>
                                            <span>Filler</span>
                                        </TableCell>
                                    </TableRow>

                                    <TableRow hover>
                                        <TableCell>
                                            <span>Filler</span>
                                        </TableCell>

                                        <TableCell>
                                            <span>Filler</span>
                                        </TableCell>

                                        <TableCell>
                                            <span>Filler</span>
                                        </TableCell>

                                        <TableCell>
                                            <span>Filler</span>
                                        </TableCell>

                                        <TableCell>
                                            <span>Filler</span>
                                        </TableCell>
                                    </TableRow>

                                    <TableRow hover>
                                        <TableCell>
                                            <span>Filler</span>
                                        </TableCell>

                                        <TableCell>
                                            <span>Filler</span>
                                        </TableCell>

                                        <TableCell>
                                            <span>Filler</span>
                                        </TableCell>

                                        <TableCell>
                                            <span>Filler</span>
                                        </TableCell>

                                        <TableCell>
                                            <span>Filler</span>
                                        </TableCell>
                                    </TableRow>

                                    <TableRow hover>
                                        <TableCell>
                                            <span>Filler</span>
                                        </TableCell>

                                        <TableCell>
                                            <span>Filler</span>
                                        </TableCell>

                                        <TableCell>
                                            <span>Filler</span>
                                        </TableCell>

                                        <TableCell>
                                            <span>Filler</span>
                                        </TableCell>

                                        <TableCell>
                                            <span>Filler</span>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Box
                        sx={{
                            'height': 250,
                            'p': 2,
                            'background': (theme) =>
                                semiTransparentBackground[theme.palette.mode],
                            boxShadow,
                            'borderRadius': 3,
                            '&:hover': {
                                background: (theme) =>
                                    semiTransparentBackgroundIntensified[
                                        theme.palette.mode
                                    ],
                                boxShadow,
                            },
                        }}
                    >
                        <Typography sx={typographySx}>
                            <FormattedMessage id="admin.billing.graph.dataByMonth.header" />
                        </Typography>
                    </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Box
                        sx={{
                            'height': 250,
                            'p': 2,
                            'background': (theme) =>
                                semiTransparentBackground[theme.palette.mode],
                            boxShadow,
                            'borderRadius': 3,
                            '&:hover': {
                                background: (theme) =>
                                    semiTransparentBackgroundIntensified[
                                        theme.palette.mode
                                    ],
                                boxShadow,
                            },
                        }}
                    >
                        <Typography sx={typographySx}>
                            <FormattedMessage id="admin.billing.graph.connectorsByMonth.header" />
                        </Typography>
                    </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Box
                        sx={{
                            'height': 250,
                            'p': 2,
                            'background': (theme) =>
                                semiTransparentBackground[theme.palette.mode],
                            boxShadow,
                            'borderRadius': 3,
                            '&:hover': {
                                background: (theme) =>
                                    semiTransparentBackgroundIntensified[
                                        theme.palette.mode
                                    ],
                                boxShadow,
                            },
                        }}
                    >
                        <Typography sx={typographySx}>
                            <FormattedMessage id="admin.billing.graph.dataByTask.header" />
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </PageContainer>
    );
}

export default AdminBilling;
