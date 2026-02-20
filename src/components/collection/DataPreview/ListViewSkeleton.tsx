import { Box, Grid, Typography, useTheme } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import { DataGridRowSkeleton } from 'src/components/collection/CollectionSkeletons';
import ListAndDetails from 'src/components/editor/ListAndDetails';
import { JsonSchemaSkeleton } from 'src/components/editor/MonacoEditor/EditorSkeletons';
import { defaultOutline, semiTransparentBackground } from 'src/context/Theme';

function ListViewSkeleton() {
    const theme = useTheme();

    return (
        <Grid size={{ xs: 12 }}>
            <ListAndDetails
                backgroundColor={semiTransparentBackground[theme.palette.mode]}
                details={<JsonSchemaSkeleton padding={2} opacity={0.75} />}
                displayBorder
                list={
                    <Box>
                        <Box
                            sx={{
                                height: 40,
                                px: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                borderBottom:
                                    defaultOutline[theme.palette.mode],
                            }}
                        >
                            <Typography sx={{ fontWeight: 500 }}>
                                <FormattedMessage id="detailsPanel.dataPreview.listView.header" />
                            </Typography>
                        </Box>

                        <DataGridRowSkeleton opacity={0.75} showBorder />

                        <DataGridRowSkeleton opacity={0.5} showBorder />

                        <DataGridRowSkeleton opacity={0.25} showBorder />
                    </Box>
                }
            />
        </Grid>
    );
}

export default ListViewSkeleton;
