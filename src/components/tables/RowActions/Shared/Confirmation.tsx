import { List, ListItem, Typography } from '@mui/material';
import NestedListItem from './NestedListItem';
import { RowActionConfirmationProps } from './types';

function RowActionConfirmation({
    message,
    selected,
    selectableTableStoreName,
    settings,
}: RowActionConfirmationProps) {
    const renderListItems =
        settings && settings.length > 0 && selectableTableStoreName
            ? (value: string) => (
                  <NestedListItem
                      key={`confirmation-selected-items-${value}`}
                      catalogName={value}
                      selectableTableStoreName={selectableTableStoreName}
                      settings={settings}
                  />
              )
            : (value: string) => (
                  <ListItem
                      component="div"
                      key={`confirmation-selected-items-${value}`}
                  >
                      <Typography component="span" sx={{ fontWeight: 500 }}>
                          {value}
                      </Typography>
                  </ListItem>
              );

    return (
        <>
            {message}

            <List component="div">{selected.map(renderListItems)}</List>
        </>
    );
}

export default RowActionConfirmation;
