import { useCallback, useRef, useState } from 'react';

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
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
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateAndSetFile = useCallback(
        (file: File) => {
            if (file.size > MAX_FILE_SIZE_BYTES) {
                setFileError(
                    intl.formatMessage({
                        id: 'fileUpload.dropzone.error.tooLarge',
                    })
                );
                setSelectedFile(null);
            } else {
                setFileError(null);
                setSelectedFile(file);
            }
        },
        [intl]
    );

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
            onFileRead(null);
            setSelectedFile(null);
        };
        reader.onerror = () => {
            onFileRead(null);
            setSelectedFile(null);
        };
        reader.onloadend = () => {
            const result = reader.result ?? null;
            onFileRead(result as string);
            setSelectedFile(null);
            setFileError(null);
        };

        reader.readAsText(selectedFile);
    }, [onFileRead, selectedFile]);

    const handleClose = useCallback(() => {
        setSelectedFile(null);
        setFileError(null);
        setIsDragOver(false);
        onClose();
    }, [onClose]);

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>{title}</DialogTitle>

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
                        'border': '2px dashed',
                        'borderColor': isDragOver
                            ? 'primary.main'
                            : fileError
                              ? 'error.main'
                              : 'divider',
                        'borderRadius': 1,
                        'p': 4,
                        'mt': 1,
                        'textAlign': 'center',
                        'cursor': 'pointer',
                        'bgcolor': isDragOver
                            ? 'action.hover'
                            : 'background.default',
                        'transition':
                            'border-color 0.2s ease, background-color 0.2s ease',
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
                                {intl.formatMessage({
                                    id: 'fileUpload.dropzone.instruction',
                                })}
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.5 }}
                            >
                                {intl.formatMessage({
                                    id: 'fileUpload.dropzone.maxSize',
                                })}
                            </Typography>
                        </>
                    )}
                </Box>

                {fileError ? (
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                        {fileError}
                    </Typography>
                ) : null}
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} variant="outlined" size="small">
                    {intl.formatMessage({ id: 'cta.cancel' })}
                </Button>
                <Button
                    disabled={!selectedFile}
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
