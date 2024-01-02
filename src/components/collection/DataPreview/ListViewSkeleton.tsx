import { Box, Grid, Skeleton, Typography, useTheme } from '@mui/material';
import ListAndDetails from 'components/editor/ListAndDetails';
import { JsonSchemaSkeleton } from 'components/editor/MonacoEditor/EditorSkeletons';
import { defaultOutline, semiTransparentBackground } from 'context/Theme';
import { FormattedMessage } from 'react-intl';

interface ListItemSkeletonProps {
    opacity: number;
}

function ListItemSkeleton({ opacity }: ListItemSkeletonProps) {
    return (
        <Box
            sx={{
                height: 52,
                px: 1,
                py: 2,
            }}
        >
            <Box sx={{ opacity }}>
                <Skeleton variant="rectangular" />
            </Box>
        </Box>
    );
}

function ListViewSkeleton() {
    const theme = useTheme();

    return (
        <Grid item xs={12}>
            <ListAndDetails
                backgroundColor={semiTransparentBackground[theme.palette.mode]}
                details={<JsonSchemaSkeleton padding={2} opacity={0.75} />}
                displayBorder
                list={
                    <Box
                        sx={{
                            '.MuiBox-root': {
                                borderBottom:
                                    defaultOutline[theme.palette.mode],
                            },
                        }}
                    >
                        <Box
                            sx={{
                                height: 40,
                                px: '10px',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <Typography sx={{ fontWeight: 500 }}>
                                <FormattedMessage id="detailsPanel.dataPreview.listView.header" />
                            </Typography>
                        </Box>

                        <ListItemSkeleton opacity={0.75} />

                        <ListItemSkeleton opacity={0.5} />

                        <ListItemSkeleton opacity={0.25} />
                    </Box>
                }
            />
        </Grid>
    );
}

export default ListViewSkeleton;
