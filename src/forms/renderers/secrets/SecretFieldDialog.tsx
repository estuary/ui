import { useId, useState } from 'react';

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';

import { Lock } from 'iconoir-react';

import { SecretValueInput } from 'src/components/secrets/SecretValueInput';
import AlertBox from 'src/components/shared/AlertBox';
import { useEntityType } from 'src/context/EntityContext';
import { codeBackground } from 'src/context/Theme';
import { FileUploadDialog } from 'src/generatedModules/FileUpload/FileUploadDialog';
import { normalizeError } from 'src/utils/errors';

interface SecretFieldDialogProps {
    fieldLabel: string;
    description?: string;
    multiline: boolean;
    // The secret is referenced by the published task
    live: boolean;
    onClose: () => void;
    onSave: (value: string) => Promise<void>;
}

export function SecretFieldDialog({
    fieldLabel,
    description,
    multiline,
    live,
    onClose,
    onSave,
}: SecretFieldDialogProps) {
    const theme = useTheme();
    const entityType = useEntityType();
    const titleId = useId();

    const [value, setValue] = useState('');
    const [uploadOpen, setUploadOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<Error | null>(null);

    const handleClose = () => {
        if (!saving) {
            onClose();
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveError(null);

        try {
            await onSave(value);
        } catch (error) {
            setSaveError(normalizeError(error) ?? null);
            setSaving(false);
        }
    };

    return (
        <Dialog
            open
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            aria-labelledby={titleId}
        >
            <DialogTitle id={titleId}>{fieldLabel}</DialogTitle>

            <DialogContent>
                <Stack spacing={3} sx={{ pt: 1 }}>
                    <Stack spacing={1}>
                        <SecretValueInput
                            value={value}
                            onChange={setValue}
                            labelledBy={titleId}
                            helperText={description}
                            disabled={saving}
                            minRows={multiline ? 1 : undefined}
                            maxRows={multiline ? undefined : 5}
                        />

                        {multiline ? (
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                }}
                            >
                                <Button
                                    size="small"
                                    disabled={saving}
                                    onClick={() => setUploadOpen(true)}
                                >
                                    Use secret from file
                                </Button>
                            </Box>
                        ) : null}
                    </Stack>

                    {live ? (
                        <AlertBox short severity="warning">
                            {`Saving changes this secret immediately, even without publishing. Running tasks that use it will get the new value the next time they restart.`}
                        </AlertBox>
                    ) : null}

                    <Stack
                        direction="row"
                        spacing={1.25}
                        alignItems="center"
                        sx={{
                            p: 1.5,
                            borderRadius: 1.5,
                            bgcolor: codeBackground[theme.palette.mode],
                        }}
                    >
                        <Lock
                            aria-hidden="true"
                            color={theme.palette.primary.main}
                            style={{ flex: 'none', fontSize: 16 }}
                        />
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ overflowWrap: 'anywhere' }}
                        >
                            The value is encrypted before it&apos;s saved and
                            never appears in the {entityType} spec.
                        </Typography>
                    </Stack>

                    {saveError ? (
                        <AlertBox short severity="error">
                            {saveError.message || 'Unknown error'}
                        </AlertBox>
                    ) : null}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button
                    variant="outlined"
                    disabled={saving}
                    onClick={handleClose}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    loading={saving}
                    disabled={!value}
                    onClick={handleSave}
                >
                    Save secret
                </Button>
            </DialogActions>

            <FileUploadDialog
                open={uploadOpen}
                title="Use secret from file"
                onClose={() => setUploadOpen(false)}
                onFileRead={(content) => setValue(content ?? '')}
            />
        </Dialog>
    );
}
