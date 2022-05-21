import { Alert, AlertTitle, List, ListItem } from '@mui/material';
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
            <List>
                {deleting.map((value: any, index: number) => {
                    return <ListItem key={index}>{value}</ListItem>;
                })}
            </List>
        </>
    );
}

export default DeleteConfirmation;
