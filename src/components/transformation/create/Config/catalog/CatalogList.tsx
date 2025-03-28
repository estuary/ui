import type { MouseEventHandler, ReactNode } from 'react';

import { Box, Button, List, Stack, Typography, useTheme } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import { defaultOutline } from 'src/context/Theme';

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

                        <Button
                            disabled={!extendList}
                            onClick={addButtonClickHandler}
                            style={{ borderRadius: 0 }}
                            variant="text"
                        >
                            <FormattedMessage id="cta.add" />
                        </Button>
                    </Stack>
                ) : undefined
            }
        >
            <Box sx={{ height, overflowY: 'auto' }}>{content}</Box>
        </List>
    );
}

export default CatalogList;
