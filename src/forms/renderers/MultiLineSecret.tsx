import { and, optionIs, RankedTester, rankWith } from '@jsonforms/core';
import {
    MaterialInputControl,
    MuiInputText,
} from '@jsonforms/material-renderers';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { Box, Button, Stack } from '@mui/material';
import { useCallback, useState } from 'react';
import { DropzoneDialog } from 'react-mui-dropzone';

export const MULTI_LINE_SECRET = 'multiLineSecret';

export const multiLineSecretTester: RankedTester = rankWith(
    999,
    and(optionIs('format', MULTI_LINE_SECRET))
);

// This is blank on purpose. For right now we can just show null settings are nothing
const MultiLineSecretRenderer = (props: any) => {
    const { handleChange, path, uischema } = props;

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

    // Make it a password again so the input is masked
    uischema.options.format = 'password';

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
                        sx={{ whiteSpace: 'nowrap' }}
                        onClick={() => setIsUploadOpen(!isUploadOpen)}
                    >
                        Use secret from file
                    </Button>
                </Box>
            </Stack>

            <DropzoneDialog
                open={isUploadOpen}
                onSave={submitFile}
                filesLimit={1}
                // List taken from -> https://pki-tutorial.readthedocs.io/en/latest/mime.html
                acceptedFiles={[
                    '.pem',
                    '.p8',
                    '.p10',
                    '.p12',
                    '.key',
                    '.csr',
                    '.cer',
                    '.cr1',
                    '.crt',
                    '.p7c',
                    '.p7b',
                    '.p7r',
                    '.der',
                    '.pfx',
                    '.spc',
                    // Additions
                    '.json',
                    '',
                ]}
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
