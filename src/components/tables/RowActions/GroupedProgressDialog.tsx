import type { GroupedProgressDialogProps } from 'src/components/tables/RowActions/types';

import { useCallback, useEffect, useState } from 'react';

import {
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
} from '@mui/material';

import { useIntl } from 'react-intl';

function GroupedProgressDialog({
    selectedEntities,
    finished,
    renderComponent,
}: GroupedProgressDialogProps) {
    const intl = useIntl();

    const [done, setDone] = useState(false);
    const [finishedCount, setFinishedCount] = useState(0);

    const onClose = () => {
        setFinishedCount(0);
        finished();
    };

    const onFinish = useCallback(() => {
        if (done) {
            return;
        }

        setFinishedCount((prev) => prev + 1);
    }, [done]);

    useEffect(() => {
        if (finishedCount > 0) {
            setDone(true);
        }
    }, [finishedCount]);

    return (
        <>
            <DialogTitle>
                <Typography component="div" variant="h6">
                    {intl.formatMessage({
                        id: done ? 'common.done' : 'common.inProgress',
                    })}
                </Typography>
            </DialogTitle>

            <DialogContent>
                <Stack direction="column" spacing={2}>
                    {selectedEntities.length > 0
                        ? renderComponent(selectedEntities, onFinish)
                        : null}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} disabled={!done}>
                    {intl.formatMessage({
                        id: 'cta.close',
                    })}
                </Button>
            </DialogActions>
        </>
    );
}

export default GroupedProgressDialog;
