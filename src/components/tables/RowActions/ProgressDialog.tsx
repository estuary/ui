import {
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
} from '@mui/material';
import { ReactNode, useState } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    selectedEntities: any[];
    renderComponent: (
        item: any,
        index: number,
        onFinish: (response: any) => void
    ) => ReactNode;
    finished: Function;
}

function ProgressDialog({
    selectedEntities,
    finished,
    renderComponent,
}: Props) {
    const [done, setDone] = useState(false);
    const [finishedEntities, setFinishedEntities] = useState<any[]>([]);

    const onFinish = (response: any) => {
        finishedEntities.push(response);
        setFinishedEntities(finishedEntities);
        if (finishedEntities.length === selectedEntities.length) {
            setDone(true);
        }
    };

    const onClose = () => {
        setFinishedEntities([]);
        finished();
    };

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
                        ? selectedEntities.map((item, index) =>
                              renderComponent(item, index, onFinish)
                          )
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

export default ProgressDialog;
