import { List, ListItem, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { SelectTableStoreNames } from 'stores/names';
import NestedListItem, { SettingMetadata } from './NestedListItem';

interface RowActionConfirmationProps {
    message: ReactNode;
    selected: any; //SelectableTableStore['selected'];
    selectableTableStoreName?:
        | SelectTableStoreNames.CAPTURE
        | SelectTableStoreNames.COLLECTION
        | SelectTableStoreNames.COLLECTION_SELECTOR
        | SelectTableStoreNames.MATERIALIZATION;
    settings?: SettingMetadata[];
}

function RowActionConfirmation({
    message,
    selected,
    selectableTableStoreName,
    settings,
}: RowActionConfirmationProps) {
    if (settings && settings.length > 0 && selectableTableStoreName) {
        return (
            <>
                {message}
                <List>
                    {selected.map((value: string) => (
                        <NestedListItem
                            key={`list-item-${value}`}
                            catalogName={value}
                            selectableTableStoreName={selectableTableStoreName}
                            settings={settings}
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
