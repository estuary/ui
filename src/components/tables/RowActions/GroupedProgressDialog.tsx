import type { GroupedProgressDialogProps } from 'src/components/tables/RowActions/types';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
} from '@mui/material';

import { FormattedMessage } from 'react-intl';

function GroupedProgressDialog({
    selectedEntities,
    finished,
    renderComponent,
}: GroupedProgressDialogProps) {
    const inProgressCount = useRef(selectedEntities.length);
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
        if (finishedCount === inProgressCount.current) {
            setDone(true);
        }
    }, [finishedCount]);

    return (
        <>
            <DialogTitle>
                <Typography component="div" variant="h6">
                    <FormattedMessage
                        id={done ? 'common.done' : 'common.inProgress'}
                    />
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
                    <FormattedMessage id="cta.close" />
                </Button>
            </DialogActions>
        </>
    );
}

export default GroupedProgressDialog;
