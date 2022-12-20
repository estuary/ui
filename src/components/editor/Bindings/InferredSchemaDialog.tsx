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
import { createDraftSpec, modifyDraftSpec } from 'api/draftSpecs';
import { getLiveSpecsByCatalogName } from 'api/liveSpecsExt';
import { CollectionData } from 'components/editor/Bindings/types';
import {
    DEFAULT_HEIGHT,
    DEFAULT_TOOLBAR_HEIGHT,
} from 'components/editor/MonacoEditor';
import { useEditorStore_persistedDraftId } from 'components/editor/Store/hooks';
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
    collectionData: CollectionData;
    inferredSchema: Schema;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    setCollectionData: Dispatch<
        SetStateAction<CollectionData | null | undefined>
    >;
    height?: number;
    toolbarHeight?: number;
}

const CustomWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))({
    [`& .${tooltipClasses.tooltip}`]: {
        maxWidth: 400,
    },
    [`& .${tooltipClasses.popper}`]: {
        overflowWrap: 'break-word',
    },
});

const TITLE_ID = 'inferred-schema-dialog-title';

function InferredSchemaDialog({
    catalogName,
    collectionData,
    inferredSchema,
    open,
    setOpen,
    setCollectionData,
    height = DEFAULT_HEIGHT,
    toolbarHeight = DEFAULT_TOOLBAR_HEIGHT,
}: Props) {
    const theme = useTheme();

    // Draft Editor Store
    const persistedDraftId = useEditorStore_persistedDraftId();

    const handlers = {
        closeConfirmationDialog: (event: React.MouseEvent<HTMLElement>) => {
            event.preventDefault();

            setOpen(false);
        },
        updateServer: async (event: React.MouseEvent<HTMLElement>) => {
            event.preventDefault();

            if (persistedDraftId) {
                if (collectionData.belongsToDraft) {
                    modifyDraftSpec(inferredSchema, {
                        draft_id: persistedDraftId,
                        catalog_name: catalogName,
                    }).then(
                        () => setOpen(false),
                        (error) => {
                            console.log('schema update error', error);
                        }
                    );
                } else {
                    const liveSpecsResponse = await getLiveSpecsByCatalogName(
                        catalogName,
                        'collection'
                    );

                    if (liveSpecsResponse.error) {
                        console.log(
                            'live spec call failed',
                            liveSpecsResponse.error
                        );
                    } else if (liveSpecsResponse.data) {
                        const { last_pub_id } = liveSpecsResponse.data[0];

                        console.log('expected pub', last_pub_id);

                        const draftSpecResponse = await createDraftSpec(
                            persistedDraftId,
                            catalogName,
                            inferredSchema,
                            'collection',
                            last_pub_id
                        );

                        if (draftSpecResponse.error) {
                            console.log(
                                'draft spec call failed',
                                draftSpecResponse.error
                            );
                        } else if (
                            draftSpecResponse.data &&
                            draftSpecResponse.data.length > 0
                        ) {
                            setCollectionData({
                                spec: draftSpecResponse.data[0].spec,
                                belongsToDraft: true,
                            });
                        }
                    }
                }
            }
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
                        original={stringifyJSON(collectionData.spec)}
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

                <Button onClick={handlers.updateServer}>
                    <FormattedMessage id="workflows.collectionSelector.schemaInference.cta.continue" />
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default InferredSchemaDialog;
