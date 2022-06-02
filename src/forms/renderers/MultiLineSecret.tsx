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
    const { handleChange, path } = props;

    const [isUploadOpen, setIsUploadOpen] = useState(false);

    const submitFile = useCallback(
        (acceptedFiles) => {
            if (acceptedFiles) {
                acceptedFiles.forEach((file: File) => {
                    const reader = new FileReader();

                    reader.onabort = () => {
                        console.log('file reading was aborted');
                    };
                    reader.onerror = () => {
                        console.log('file reading has failed');
                    };
                    reader.onload = (event) => {
                        const fileTextValue = event.target?.result ?? null;

                        handleChange(path, fileTextValue);
                        setIsUploadOpen(false);
                    };
                    reader.readAsText(file);
                });
            }

            setIsUploadOpen(false);
        },
        [handleChange, path]
    );

    // Make it a password again
    // eslint-disable-next-line react/destructuring-assignment
    props.uischema.options.format = 'password';

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
                        Upload Secret
                    </Button>
                </Box>
            </Stack>

            <DropzoneDialog
                open={isUploadOpen}
                onSave={submitFile}
                filesLimit={1}
                acceptedFiles={[
                    // List taken fromhttps://pki-tutorial.readthedocs.io/en/latest/mime.html
                    'application/pkcs8', //                .p8  .key
                    'application/pkcs10', //               .p10 .csr
                    'application/pkix-cert', //            .cer
                    'application/pkix-crl ', //            .crl
                    'application/pkcs7-mime', //           .p7c

                    'application/x-x509-ca-cert', //       .crt .der
                    'application/x-x509-user-cert', //     .crt
                    'application/x-pkcs7-crl', //          .crl

                    'application/x-pem-file', //           .pem
                    'application/x-pkcs12', //             .p12 .pfx

                    'application/x-pkcs7-certificates', // .p7b .spc
                    'application/x-pkcs7-certreqresp', //  .p7r
                    'text/plain',
                ]}
                showAlerts={false}
                showPreviews={false}
                showPreviewsInDropzone={true}
                useChipsForPreview={true}
                maxFileSize={5000000}
                onClose={() => setIsUploadOpen(false)}
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
    // return <Input style={{ width: '100%' }} type="file" />;
};

export const MultiLineSecret = withJsonFormsControlProps(
    MultiLineSecretRenderer
);
