import { DiffEditor } from '@monaco-editor/react';
import { Refresh } from '@mui/icons-material';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    styled,
    Tooltip,
    tooltipClasses,
    TooltipProps,
    Typography,
    useTheme,
} from '@mui/material';
import {
    DEFAULT_HEIGHT,
    DEFAULT_TOOLBAR_HEIGHT,
} from 'components/editor/MonacoEditor';
import {
    glassBkgWithoutBlur,
    secondaryButtonBackground,
    secondaryButtonHoverBackground,
} from 'context/Theme';
import { Dispatch, SetStateAction } from 'react';
import { FormattedMessage } from 'react-intl';
import { stringifyJSON } from 'services/stringify';
import { Schema } from 'types';

interface Props {
    catalogName: string;
    originalSchema: Schema;
    inferredSchema: Schema;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    height?: number;
    toolbarHeight?: number;
}

const CustomWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))({
    [`& .${tooltipClasses.tooltip}`]: {
        minWidth: 400,
    },
    [`& .${tooltipClasses.popper}`]: {
        overflowWrap: 'break-word',
    },
});

const TITLE_ID = 'inferred-schema-dialog-title';

function InferredSchemaDialog({
    catalogName,
    originalSchema,
    inferredSchema,
    open,
    setOpen,
    height = DEFAULT_HEIGHT,
    toolbarHeight = DEFAULT_TOOLBAR_HEIGHT,
}: Props) {
    const theme = useTheme();

    const handlers = {
        closeConfirmationDialog: (event: React.MouseEvent<HTMLElement>) => {
            event.preventDefault();

            setOpen(false);
        },
    };

    return (
        <Dialog
            open={open}
            maxWidth="lg"
            aria-labelledby={TITLE_ID}
            sx={{
                '& .MuiPaper-root.MuiDialog-paper': {
                    backgroundColor: glassBkgWithoutBlur[theme.palette.mode],
                    borderRadius: 5,
                },
            }}
        >
            <DialogTitle>
                <FormattedMessage id="workflows.collectionSelector.schemaInference.header" />
            </DialogTitle>

            <DialogContent>
                <Typography sx={{ mb: 4 }}>
                    <FormattedMessage id="workflows.collectionSelector.schemaInference.message" />
                </Typography>

                <Box sx={{ maxWidth: 'auto' }}>
                    <Box
                        sx={{
                            p: 1,
                            minHeight: toolbarHeight,
                            backgroundColor: '#121212',
                        }}
                    >
                        <Stack
                            direction="row"
                            sx={{
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <CustomWidthTooltip
                                title={catalogName}
                                placement="bottom-start"
                            >
                                <Typography noWrap sx={{ mr: 2 }}>
                                    {catalogName}
                                </Typography>
                            </CustomWidthTooltip>

                            <IconButton>
                                <Refresh />
                            </IconButton>
                        </Stack>
                    </Box>

                    <DiffEditor
                        height={`${height}px`}
                        original={stringifyJSON(originalSchema)}
                        modified={stringifyJSON(inferredSchema)}
                        theme={
                            theme.palette.mode === 'light' ? 'vs' : 'vs-dark'
                        }
                    />
                </Box>
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={handlers.closeConfirmationDialog}
                    sx={{
                        'backgroundColor':
                            secondaryButtonBackground[theme.palette.mode],
                        '&:hover': {
                            backgroundColor:
                                secondaryButtonHoverBackground[
                                    theme.palette.mode
                                ],
                        },
                    }}
                >
                    <FormattedMessage id="cta.cancel" />
                </Button>

                <Button onClick={handlers.closeConfirmationDialog}>
                    <FormattedMessage id="workflows.collectionSelector.schemaInference.cta.continue" />
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default InferredSchemaDialog;
