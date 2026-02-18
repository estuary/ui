import { useCallback, useState } from 'react';

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

import { CloudUpload } from 'iconoir-react';
import { useIntl } from 'react-intl';

const MAX_FILE_SIZE_BYTES = 5_000_000;

interface FileUploadDialogProps {
    open: boolean;
    title: string;
    onClose: () => void;
    onFileRead: (content: string | null) => void;
}

export const FileUploadDialog = ({
    open,
    title,
    onClose,
    onFileRead,
}: FileUploadDialogProps) => {
    const intl = useIntl();

    const [isDragOver, setIsDragOver] = useState(false);
    const [isReading, setIsReading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);

    const validateAndSetFile = useCallback(
        (file: File) => {
            let fileError: string | null = null;
            let fileContent: File | null = file;

            if (file.size === 0) {
                // Happens on empty files AND when a directory is selected
                //  Directories usually had an empty `type` prop so if we want to
                //      manually check for that we could but feels unneeded (Q1 2026).
                fileError = intl.formatMessage({
                    id: 'fileUpload.dropzone.error.tooSmall',
                });
                fileContent = null;
            } else if (file.size > MAX_FILE_SIZE_BYTES) {
                fileError = intl.formatMessage({
                    id: 'fileUpload.dropzone.error.tooLarge',
                });
                fileContent = null;
            }

            setFileError(fileError);
            setSelectedFile(fileContent);
        },
        [intl]
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

        setIsReading(true);

        reader.onabort = () => {
            onFileRead(null);
            setSelectedFile(null);
            setIsReading(false);
        };
        reader.onerror = () => {
            onFileRead(null);
            setSelectedFile(null);
            setIsReading(false);
        };
        reader.onloadend = () => {
            const result = reader.result ?? null;
            onFileRead(result as string);
            setSelectedFile(null);
            setFileError(null);
            setIsReading(false);
        };

        reader.readAsText(selectedFile);
    }, [onFileRead, selectedFile]);

    const handleClose = useCallback(() => {
        setSelectedFile(null);
        setFileError(null);
        setIsDragOver(false);
        setIsReading(false);
        onClose();
    }, [onClose]);

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>{title}</DialogTitle>

            <DialogContent>
                <Box
                    sx={{
                        'bgcolor': isDragOver
                            ? 'action.hover'
                            : 'background.default',
                        'border': '2px dashed',
                        'borderColor': isDragOver
                            ? 'primary.main'
                            : fileError
                              ? 'error.main'
                              : 'divider',
                        'borderRadius': 1,
                        'cursor': 'pointer',
                        'mt': 1,
                        'p': 4,
                        'position': 'relative',
                        'textAlign': 'center',
                        '&:hover': {
                            borderColor: fileError
                                ? 'error.main'
                                : 'primary.main',
                            bgcolor: 'action.hover',
                        },
                        '&:has(input:focus-visible)': {
                            outline: '2px solid',
                            outlineColor: 'primary.main',
                            outlineOffset: '2px',
                        },
                    }}
                >
                    <input
                        type="file"
                        title={intl.formatMessage({
                            id: 'fileUpload.input.title',
                        })}
                        style={{
                            cursor: 'pointer',
                            height: '100%',
                            inset: 0,
                            opacity: 0,
                            position: 'absolute',
                            width: '100%',
                        }}
                        onChange={handleFileSelect}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragOver(true);
                        }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={() => setIsDragOver(false)}
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
                        <Stack spacing={1}>
                            <Typography>
                                {intl.formatMessage({
                                    id: 'fileUpload.dropzone.instruction',
                                })}
                            </Typography>
                            <Typography>
                                {intl.formatMessage({
                                    id: 'fileUpload.dropzone.maxSize',
                                })}
                            </Typography>
                        </Stack>
                    )}
                </Box>

                {fileError ? (
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                        {fileError}
                    </Typography>
                ) : null}
            </DialogContent>

            <DialogActions>
                <Button
                    disabled={isReading}
                    onClick={handleClose}
                    variant="outlined"
                    size="small"
                >
                    {intl.formatMessage({ id: 'cta.cancel' })}
                </Button>
                <Button
                    disabled={!selectedFile || isReading}
                    onClick={handleConfirm}
                    variant="contained"
                    size="small"
                >
                    {intl.formatMessage({ id: 'cta.save' })}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
