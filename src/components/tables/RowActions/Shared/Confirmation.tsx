import { Divider, List, ListItem, Stack, Typography } from '@mui/material';
import MessageWithLink from 'components/content/MessageWithLink';
import AlertBox from 'components/shared/AlertBox';
import { ReactNode, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { SelectTableStoreNames } from 'stores/names';
import { RowConfirmation } from '../AccessGrants/types';
import NestedListItem, { SettingMetadata } from './NestedListItem';

interface RowActionConfirmationProps {
    message: ReactNode;
    selected: RowConfirmation[]; //SelectableTableStore['selected'];
    selectableTableStoreName?:
        | SelectTableStoreNames.CAPTURE
        | SelectTableStoreNames.COLLECTION
        | SelectTableStoreNames.ENTITY_SELECTOR
        | SelectTableStoreNames.MATERIALIZATION;
    settings?: SettingMetadata[];
}

function RowActionConfirmation({
    message,
    selected,
    selectableTableStoreName,
    settings,
}: RowActionConfirmationProps) {
    const intl = useIntl();

    const potentiallyDangerousUpdates = useMemo(
        () => selected.filter(({ highlight }) => highlight),
        [selected]
    );

    const normalUpdates = useMemo(
        () => selected.filter(({ highlight }) => !highlight),
        [selected]
    );

    const renderListItems =
        settings && settings.length > 0 && selectableTableStoreName
            ? (item: RowConfirmation) => (
                  <NestedListItem
                      key={`confirmation-selected-items-${item.message}`}
                      catalogName={item.message}
                      selectableTableStoreName={selectableTableStoreName}
                      settings={settings}
                  />
              )
            : (item: RowConfirmation) => (
                  <ListItem
                      component="div"
                      key={`confirmation-selected-items-${item.message}`}
                  >
                      <Typography component="span" style={{ fontWeight: 500 }}>
                          {item.message}
                      </Typography>
                  </ListItem>
              );

    return (
        <>
            {message}

            <List component="div">{normalUpdates.map(renderListItems)}</List>

            {potentiallyDangerousUpdates.length > 0 ? (
                <Stack spacing={2}>
                    <Divider />
                    <AlertBox
                        short
                        severity="error"
                        title={intl.formatMessage({
                            id: 'row.actions.extra.confirmation.title',
                        })}
                    >
                        <Typography component="div">
                            <MessageWithLink messageID="row.actions.extra.confirmation.message" />
                        </Typography>
                    </AlertBox>
                    <List component="div">
                        {potentiallyDangerousUpdates.map(renderListItems)}
                    </List>
                </Stack>
            ) : null}
        </>
    );
}

export default RowActionConfirmation;
