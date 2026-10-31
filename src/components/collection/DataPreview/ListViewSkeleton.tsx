import {
    Grid,
    List,
    ListItem,
    ListItemText,
    Skeleton,
    useTheme,
} from '@mui/material';

import { KeysHeader } from 'src/components/collection/DataPreview/KeysHeader';
import ListAndDetails from 'src/components/editor/ListAndDetails';
import { JsonSchemaSkeleton } from 'src/components/editor/MonacoEditor/EditorSkeletons';
import { defaultOutline, semiTransparentBackground } from 'src/context/Theme';

const ROW_OPACITIES = [0.75, 0.5, 0.25];

function ListViewSkeleton() {
    const theme = useTheme();

    return (
        <Grid size={{ xs: 12 }}>
            <ListAndDetails
                backgroundColor={semiTransparentBackground[theme.palette.mode]}
                details={<JsonSchemaSkeleton padding={2} opacity={0.75} />}
                displayBorder
                removeMargin
                sx={{ borderRadius: 3 }}
                list={
                    <>
                        <KeysHeader />

                        {/* Rows lay out like the key list's, so they are the same height. */}
                        <List disablePadding>
                            {ROW_OPACITIES.map((opacity) => (
                                <ListItem
                                    key={opacity}
                                    sx={{
                                        borderBottom:
                                            defaultOutline[theme.palette.mode],
                                    }}
                                >
                                    <ListItemText sx={{ opacity }}>
                                        <Skeleton variant="text" />
                                    </ListItemText>
                                </ListItem>
                            ))}
                        </List>
                    </>
                }
            />
        </Grid>
    );
}

export default ListViewSkeleton;
