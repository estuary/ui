import { List, ListItem, Typography } from '@mui/material';
import { ReactNode } from 'react';
import NestedListItem from './NestedListItem';

interface RowActionConfirmationProps {
    message: ReactNode;
    selected: any; //SelectableTableStore['selected'];
    nestedItem?: ReactNode;
}

function RowActionConfirmation({
    message,
    selected,
    nestedItem,
}: RowActionConfirmationProps) {
    if (nestedItem) {
        return (
            <>
                {message}
                <List>
                    {selected.map((value: string) => (
                        <NestedListItem
                            key={`list-item-${value}`}
                            catalogName={value}
                            nestedItem={nestedItem}
                        />
                    ))}
                </List>
            </>
        );
    }

    return (
        <>
            {message}
            <List>
                {selected.map((value: string) => {
                    return (
                        <ListItem key={`confirmation-selected-items-${value}`}>
                            <Typography
                                component="span"
                                sx={{ fontWeight: 500 }}
                            >
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
