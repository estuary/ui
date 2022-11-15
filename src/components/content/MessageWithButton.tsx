import { Code } from '@mui/icons-material';
import { Box, Button, Fade, Popper, Typography, useTheme } from '@mui/material';
import { useEditorStore_persistedDraftId } from 'components/editor/Store/hooks';
import {
    glassBkgWithBlur,
    reflexSplitterBackground,
    slate,
} from 'context/Theme';
import { MouseEvent, useState } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    messageID: string;
}

function MessageWithButton({ messageID }: Props) {
    const theme = useTheme();
    const persistedDraftId = useEditorStore_persistedDraftId();

    const [open, setOpen] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const canBeOpen = open && Boolean(anchorEl);
    const id = canBeOpen ? 'transition-popper' : undefined;

    const handleClick = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        setOpen((previousOpen) => !previousOpen);
    };

    return (
        <FormattedMessage
            id={messageID}
            tagName={Box}
            values={{
                buttonLabel: (
                    <>
                        <Button
                            variant="text"
                            size="small"
                            onClick={handleClick}
                            sx={{ mb: 0.5 }}
                        >
                            <FormattedMessage id={`${messageID}.buttonLabel`} />
                        </Button>

                        <Popper
                            id={id}
                            open={open}
                            anchorEl={anchorEl}
                            transition
                        >
                            {({ TransitionProps }) => (
                                <Fade {...TransitionProps} timeout={350}>
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: 5,
                                            ...glassBkgWithBlur[
                                                theme.palette.mode
                                            ],
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                mb: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Code />

                                            <Typography
                                                variant="h6"
                                                sx={{ ml: 1 }}
                                            >
                                                <FormattedMessage id="workflows.collectionSelector.schemaEdit.header" />
                                            </Typography>
                                        </Box>

                                        <Typography sx={{ mb: 3 }}>
                                            <FormattedMessage id="workflows.collectionSelector.schemaEdit.description" />
                                        </Typography>

                                        <Typography sx={{ mb: 1 }}>
                                            <FormattedMessage id="workflows.collectionSelector.schemaEdit.message1" />
                                        </Typography>

                                        <Box
                                            sx={{
                                                mb: 3,
                                                p: 1,
                                                color: slate[800],
                                                bgcolor:
                                                    reflexSplitterBackground[
                                                        theme.palette.mode
                                                    ],
                                                borderRadius: 3,
                                            }}
                                        >
                                            <Typography>
                                                <FormattedMessage
                                                    id="workflows.collectionSelector.schemaEdit.command1"
                                                    values={{
                                                        draftId:
                                                            persistedDraftId,
                                                    }}
                                                />
                                            </Typography>

                                            <Typography>
                                                <FormattedMessage id="workflows.collectionSelector.schemaEdit.command2" />
                                            </Typography>
                                        </Box>

                                        <Typography sx={{ mb: 1 }}>
                                            <FormattedMessage id="workflows.collectionSelector.schemaEdit.message2" />
                                        </Typography>

                                        <Box
                                            sx={{
                                                p: 1,
                                                color: slate[800],
                                                bgcolor:
                                                    reflexSplitterBackground[
                                                        theme.palette.mode
                                                    ],
                                                borderRadius: 3,
                                            }}
                                        >
                                            <Typography>
                                                <FormattedMessage id="workflows.collectionSelector.schemaEdit.command3" />
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Fade>
                            )}
                        </Popper>
                    </>
                ),
            }}
        />
    );
}

export default MessageWithButton;
