import type { RowConfirmation } from '../types';
import type { RowActionConfirmationProps } from './types';
import { List, ListItem, Typography } from '@mui/material';
import NestedListItem from './NestedListItem';

// TODO (typing) - eventually we should remove supporting passing in string arrays
//  so that we always have an `id` and `message` to use.
function RowActionConfirmation({
    message,
    selected,
    selectableTableStoreName,
    settings,
}: RowActionConfirmationProps) {
    const renderListItems =
        settings && settings.length > 0 && selectableTableStoreName
            ? (value: string | RowConfirmation) => {
                  const valueIsString = typeof value === 'string';

                  return (
                      <NestedListItem
                          key={`confirmation-selected-items-${
                              valueIsString ? value : value.id
                          }`}
                          catalogName={valueIsString ? value : value.message}
                          selectableTableStoreName={selectableTableStoreName}
                          settings={settings}
                      />
                  );
              }
            : (value: string | RowConfirmation) => {
                  const valueIsString = typeof value === 'string';

                  return (
                      <ListItem
                          component="div"
                          key={`confirmation-selected-items-${
                              valueIsString ? value : value.id
                          }`}
                      >
                          <Typography component="span" sx={{ fontWeight: 500 }}>
                              {valueIsString ? value : value.message}
                          </Typography>
                      </ListItem>
                  );
              };

    return (
        <>
            {message}

            <List component="div">{selected.map(renderListItems)}</List>
        </>
    );
}

export default RowActionConfirmation;
