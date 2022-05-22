import {
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
} from '@mui/material';
import DeleteProgress from 'components/tables/RowActions/Delete/Progress';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    deleting: any[];
    finished: Function;
}

function ProgressDialog({ deleting, finished }: Props) {
    const [done, setDone] = useState(false);
    const [deleted, setDeleted] = useState<any[]>([]);

    const onFinish = (response: any) => {
        deleted.push(response);
        setDeleted(deleted);
        if (deleted.length === deleting.length) {
            setDone(true);
        }
    };

    const onClose = () => {
        setDeleted([]);
        finished();
    };

    return (
        <>
            <DialogTitle>
                <FormattedMessage id="common.deleting" />
            </DialogTitle>
            <DialogContent>
                <Stack direction="column">
                    {deleting.length > 0
                        ? deleting.map((item, index) => (
                              <DeleteProgress
                                  key={`Item-delete-${index}`}
                                  deleting={item}
                                  onFinish={onFinish}
                              />
                          ))
                        : null}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={!done}>
                    <FormattedMessage id="cta.close" />
                </Button>
            </DialogActions>
        </>
    );
}

export default ProgressDialog;
