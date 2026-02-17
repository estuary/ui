import type { RankedTester } from '@jsonforms/core';

import { useCallback, useState } from 'react';

import { Box, Button, Stack } from '@mui/material';

import { optionIs, rankWith } from '@jsonforms/core';
import {
    MaterialInputControl,
    MuiInputText,
} from '@jsonforms/material-renderers';
import { withJsonFormsControlProps } from '@jsonforms/react';

import { useIntl } from 'react-intl';

import { FileUploadDialog } from 'src/components/shared/Dialog/FileUpload';
import { Options } from 'src/types/jsonforms';

export const multiLineSecretTester: RankedTester = rankWith(
    10,
    optionIs(Options.multiLineSecret, true)
);

const MultiLineSecretRenderer = (props: any) => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { handleChange, path, enabled } = props;

    const intl = useIntl();
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    const handleFileRead = useCallback(
        (content: string | null) => {
            handleChange(path, content);
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
                        disabled={!enabled || isUploadOpen}
                        onClick={() => setIsUploadOpen(true)}
                        sx={{ whiteSpace: 'nowrap' }}
                    >
                        {intl.formatMessage({
                            id: 'multiLineSecret.openDialog.cta',
                        })}
                    </Button>
                </Box>
            </Stack>

            <FileUploadDialog
                open={isUploadOpen}
                title={intl.formatMessage({
                    id: 'multiLineSecret.openDialog.cta',
                })}
                onClose={() => setIsUploadOpen(false)}
                onFileRead={handleFileRead}
            />
        </>
    );
};

export const MultiLineSecret = withJsonFormsControlProps(
    MultiLineSecretRenderer
);
