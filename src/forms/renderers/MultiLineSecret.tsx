import { optionIs, RankedTester, rankWith } from '@jsonforms/core';
import {
    MaterialInputControl,
    MuiInputText,
} from '@jsonforms/material-renderers';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { Box, Button, Stack } from '@mui/material';
import { useCallback, useState } from 'react';
import { DropzoneDialog } from 'react-mui-dropzone';
import { Options } from 'types/jsonforms';

export const multiLineSecretTester: RankedTester = rankWith(
    10,
    optionIs(Options.multiLineSecret, true)
);

// This is blank on purpose. For right now we can just show null settings are nothing
const MultiLineSecretRenderer = (props: any) => {
    const { handleChange, path, enabled } = props;

    const [isUploadOpen, setIsUploadOpen] = useState(false);

    const submitFile = useCallback(
        (acceptedFiles) => {
            if (acceptedFiles) {
                const uploadDone = (inputValue: string | null) => {
                    handleChange(path, inputValue);
                    setIsUploadOpen(false);
                };

                acceptedFiles.forEach(async (file: File) => {
                    const reader = new FileReader();

                    reader.onabort = () => uploadDone(null);
                    reader.onerror = () => uploadDone(null);
                    reader.onloadend = () => {
                        const result = reader.result ?? null;
                        uploadDone(result as string);
                    };
                    reader.readAsText(file);
                });
            }

            setIsUploadOpen(false);
        },
        [handleChange, path]
    );

    return (
        <>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <MaterialInputControl
                    {...props}
                    muiInputProps={{
                        onPaste: (event: any) => {
                            // Stop the event so the change does no fire and strip out the newlines
                            event.stopPropagation();
                            event.preventDefault();

                            // Go ahead and update the value
                            handleChange(
                                path,
                                event.clipboardData.getData('text/plain')
                            );
                        },
                    }}
                    input={MuiInputText}
                />

                <Box>
                    <Button
                        disabled={!enabled}
                        onClick={() => setIsUploadOpen(!isUploadOpen)}
                        sx={{ whiteSpace: 'nowrap' }}
                    >
                        Use secret from file
                    </Button>
                </Box>
            </Stack>

            <DropzoneDialog
                open={isUploadOpen}
                onSave={submitFile}
                filesLimit={1}
                clearOnUnmount={true}
                showPreviews={false}
                showPreviewsInDropzone={true}
                useChipsForPreview={true}
                maxFileSize={5000000} //bytes
                onClose={() => setIsUploadOpen(false)}
                alertSnackbarProps={{
                    anchorOrigin: {
                        horizontal: 'center',
                        vertical: 'top',
                    },
                    autoHideDuration: 6000,
                }}
                dialogProps={{
                    open: isUploadOpen,
                    sx: {
                        '& .MuiDropzoneArea-root': {
                            'minHeight': 150,
                            'padding': 5,
                            '& .MuiDropzonePreviewList-root': {
                                justifyContent: 'center',
                            },
                        },
                    },
                }}
            />
        </>
    );
};

export const MultiLineSecret = withJsonFormsControlProps(
    MultiLineSecretRenderer
);
