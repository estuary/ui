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

import AlertBox from 'src/components/shared/AlertBox';
import { OutlinedChip } from 'src/styledComponents/chips/OutlinedChip';

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
            }
            // else if (file.size > MAX_FILE_SIZE_BYTES) {
            //     fileError = intl.formatMessage({
            //         id: 'fileUpload.dropzone.error.tooLarge',
            //     });
            //     fileContent = null;
            // }

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
            setFileError(
                intl.formatMessage({
                    id: 'fileUpload.dropzone.error.readAborted',
                })
            );
        };
        reader.onerror = () => {
            setFileError(
                intl.formatMessage({
                    id: 'fileUpload.dropzone.error.readFailed',
                })
            );
        };
        reader.onload = (event) => {
            const result = event.target?.result ?? null;
            onFileRead(result as string);
            setFileError(null);
            setSelectedFile(null);
        };
        reader.onloadend = () => {
            setIsReading(false);
        };

        reader.readAsText(selectedFile);
    }, [intl, onFileRead, selectedFile]);

    const handleClose = useCallback(() => {
        if (isReading) {
            return;
        }
        setSelectedFile(null);
        setFileError(null);
        setIsDragOver(false);
        setIsReading(false);
        onClose();
    }, [onClose, isReading]);

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>{title}</DialogTitle>

            <DialogContent>
                <Stack spacing={2}>
                    {fileError ? (
                        <AlertBox severity="error" short>
                            {fileError}
                        </AlertBox>
                    ) : null}
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

                        <Stack
                            spacing={2}
                            sx={{
                                alignItems: 'center',
                            }}
                        >
                            <CloudUpload
                                style={{
                                    width: 40,
                                    height: 40,
                                    marginBottom: 8,
                                    opacity: isDragOver ? 1 : 0.5,
                                }}
                            />

                            {selectedFile ? (
                                <OutlinedChip
                                    variant="outlined"
                                    label={selectedFile.name}
                                    onDelete={() => {
                                        setFileError(null);
                                        setSelectedFile(null);
                                    }}
                                />
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
                        </Stack>
                    </Box>
                </Stack>
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
