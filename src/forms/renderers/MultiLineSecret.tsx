import type { RankedTester } from '@jsonforms/core';

import { useCallback, useRef, useState } from 'react';

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
} from '@mui/material';

import { optionIs, rankWith } from '@jsonforms/core';
import {
    MaterialInputControl,
    MuiInputText,
} from '@jsonforms/material-renderers';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { CloudUpload } from 'iconoir-react';

import { Options } from 'src/types/jsonforms';

const MAX_FILE_SIZE_BYTES = 5_000_000;

export const multiLineSecretTester: RankedTester = rankWith(
    10,
    optionIs(Options.multiLineSecret, true)
);

const MultiLineSecretRenderer = (props: any) => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { handleChange, path, enabled } = props;

    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateAndSetFile = useCallback((file: File) => {
        if (file.size > MAX_FILE_SIZE_BYTES) {
            setFileError('File exceeds the 5 MB size limit.');
            setSelectedFile(null);
        } else {
            setFileError(null);
            setSelectedFile(file);
        }
    }, []);

    const handleFileDrop = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            setIsDragOver(false);

            const files = Array.from(event.dataTransfer.files);
            if (files.length > 0) {
                validateAndSetFile(files[0]);
            }
        },
        [validateAndSetFile]
    );

    const handleFileSelect = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const files = event.target.files;
            if (files && files.length > 0) {
                validateAndSetFile(files[0]);
            }
            // Reset input so the same file can be re-selected after clearing
            event.target.value = '';
        },
        [validateAndSetFile]
    );

    const handleConfirm = useCallback(() => {
        if (!selectedFile) {
            return;
        }

        const reader = new FileReader();

        reader.onabort = () => {
            handleChange(path, null);
            setIsUploadOpen(false);
            setSelectedFile(null);
        };
        reader.onerror = () => {
            handleChange(path, null);
            setIsUploadOpen(false);
            setSelectedFile(null);
        };
        reader.onloadend = () => {
            const result = reader.result ?? null;
            handleChange(path, result as string);
            setIsUploadOpen(false);
            setSelectedFile(null);
            setFileError(null);
        };

        reader.readAsText(selectedFile);
    }, [handleChange, path, selectedFile]);

    const handleClose = useCallback(() => {
        setIsUploadOpen(false);
        setSelectedFile(null);
        setFileError(null);
        setIsDragOver(false);
    }, []);

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
                        onClick={() => setIsUploadOpen(true)}
                        sx={{ whiteSpace: 'nowrap' }}
                    >
                        Use secret from file
                    </Button>
                </Box>
            </Stack>

            <Dialog
                open={isUploadOpen}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Upload Secret from File</DialogTitle>

                <DialogContent>
                    <Box
                        onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragOver(true);
                        }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={handleFileDrop}
                        onClick={() => fileInputRef.current?.click()}
                        sx={{
                            border: '2px dashed',
                            borderColor: isDragOver
                                ? 'primary.main'
                                : fileError
                                  ? 'error.main'
                                  : 'divider',
                            borderRadius: 1,
                            p: 4,
                            mt: 1,
                            textAlign: 'center',
                            cursor: 'pointer',
                            bgcolor: isDragOver
                                ? 'action.hover'
                                : 'background.default',
                            transition: 'border-color 0.2s ease, background-color 0.2s ease',
                            '&:hover': {
                                borderColor: fileError
                                    ? 'error.main'
                                    : 'primary.main',
                                bgcolor: 'action.hover',
                            },
                        }}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            style={{ display: 'none' }}
                            onChange={handleFileSelect}
                        />

                        <CloudUpload
                            style={{
                                width: 40,
                                height: 40,
                                marginBottom: 8,
                                opacity: isDragOver ? 1 : 0.5,
                            }}
                        />

                        {selectedFile ? (
                            <Typography variant="body1">
                                {selectedFile.name}
                            </Typography>
                        ) : (
                            <>
                                <Typography variant="body1">
                                    Drag and drop a file here, or click to
                                    browse
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mt: 0.5 }}
                                >
                                    Max file size: 5 MB
                                </Typography>
                            </>
                        )}
                    </Box>

                    {fileError ? (
                        <Typography
                            variant="body2"
                            color="error"
                            sx={{ mt: 1 }}
                        >
                            {fileError}
                        </Typography>
                    ) : null}
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose} variant="text">
                        Cancel
                    </Button>
                    <Button
                        disabled={!selectedFile}
                        onClick={handleConfirm}
                        variant="outlined"
                    >
                        Use File
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export const MultiLineSecret = withJsonFormsControlProps(
    MultiLineSecretRenderer
);
