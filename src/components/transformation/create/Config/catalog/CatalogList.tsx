import {
    Box,
    IconButton,
    List,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import { defaultOutline, disabledButtonText } from 'context/Theme';
import { Plus } from 'iconoir-react';
import { MouseEventHandler, ReactNode } from 'react';

export interface CatalogListContent {
    attributeId: string;
    value: string;
    editorInvalid: boolean;
    nestedValue?: string;
}

interface Props {
    addButtonClickHandler: MouseEventHandler<HTMLButtonElement>;
    content: ReactNode;
    extendList?: boolean;
    header?: ReactNode;
    height?: number;
}

function CatalogList({
    addButtonClickHandler,
    content,
    extendList = true,
    header,
    height,
}: Props) {
    const theme = useTheme();

    return (
        <List
            disablePadding
            subheader={
                header ? (
                    <Stack
                        direction="row"
                        sx={{
                            justifyContent: 'space-between',
                            borderBottom: defaultOutline[theme.palette.mode],
                        }}
                    >
                        <Typography
                            component="div"
                            sx={{
                                p: 1,
                                fontWeight: 500,
                                textTransform: 'uppercase',
                            }}
                        >
                            {header}
                        </Typography>

                        <IconButton
                            disabled={!extendList}
                            onClick={addButtonClickHandler}
                            sx={{ borderRadius: 0 }}
                        >
                            <Plus
                                style={{
                                    color: extendList
                                        ? theme.palette.primary.main
                                        : disabledButtonText[
                                              theme.palette.mode
                                          ],
                                }}
                            />
                        </IconButton>
                    </Stack>
                ) : undefined
            }
        >
            <Box sx={{ height, overflowY: 'auto' }}>{content}</Box>
        </List>
    );
}

export default CatalogList;
