import { Alert, AlertTitle, Box, Stack } from '@mui/material';
import { FormattedMessage } from 'react-intl';

interface DeleteConfirmationprops {
    deleting: any; //SelectableTableStore['selected'];
}

function DeleteConfirmation({ deleting }: DeleteConfirmationprops) {
    return (
        <>
            <Alert variant="filled" severity="warning">
                <AlertTitle>
                    <FormattedMessage id="common.noUnDo" />
                </AlertTitle>
                <FormattedMessage id="capturesTable.delete.confirm" />
            </Alert>
            <Stack direction="column">
                {deleting.map((value: any, index: number) => {
                    return <Box key={index}>{value}</Box>;
                })}
            </Stack>
        </>
    );
}

export default DeleteConfirmation;
