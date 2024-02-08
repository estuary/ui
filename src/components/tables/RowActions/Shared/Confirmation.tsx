import { List, ListItem, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface RowActionConfirmationProps {
    message: ReactNode;
    selected: any; //SelectableTableStore['selected'];
}

function RowActionConfirmation({
    message,
    selected,
}: RowActionConfirmationProps) {
    return (
        <>
            {message}
            <List>
                {selected.map((value: string) => {
                    return (
                        <ListItem key={`confirmation-selected-items-${value}`}>
                            <Typography variant="h6" component="span">
                                {value}
                            </Typography>
                        </ListItem>
                    );
                })}
            </List>
        </>
    );
}

export default RowActionConfirmation;
