import { Box, Divider, List, ListItem, Stack, Typography } from '@mui/material';
import MessageWithLink from 'components/content/MessageWithLink';
import AlertBox from 'components/shared/AlertBox';
import { alertColorsReversed } from 'context/Theme';
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
        () => selected.filter(({ highlight }) => Boolean(highlight)),
        [selected]
    );

    const normalUpdates = useMemo(
        () => selected.filter(({ highlight }) => Boolean(!highlight)),
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
                      <Stack direction="row" style={{ width: '100%' }}>
                          <Typography component="span" style={{ width: '50%' }}>
                              {item.message}
                          </Typography>

                          {!item.highlight ? null : (
                              // There is default styling that prevents setting margin on root stack items :shrug
                              <Box style={{ fontWeight: 500, width: '50%' }}>
                                  <Typography
                                      component="span"
                                      sx={{
                                          color: (theme) =>
                                              alertColorsReversed.error[
                                                  theme.palette.mode
                                              ],
                                      }}
                                  >
                                      {item.highlight}
                                  </Typography>
                              </Box>
                          )}
                      </Stack>
                  </ListItem>
              );

    return (
        <>
            {message}

            <List component="div">{normalUpdates.map(renderListItems)}</List>

            {potentiallyDangerousUpdates.length > 0 ? (
                <AlertBox severity="error" short={true} hideIcon>
                    <Stack spacing={1}>
                        <Typography variant="h6">
                            {intl.formatMessage({
                                id: 'row.actions.extra.confirmation.title',
                            })}
                        </Typography>
                        <Typography component="div">
                            {intl.formatMessage({
                                id: 'row.actions.extra.confirmation.message',
                            })}
                        </Typography>
                        <Typography component="div">
                            <MessageWithLink messageID="row.actions.extra.confirmation.instructions" />
                        </Typography>

                        <List component="div">
                            <ListItem component="div">
                                <Stack
                                    direction="row"
                                    style={{ width: '100%' }}
                                >
                                    <Typography
                                        component="span"
                                        style={{
                                            fontWeight: 500,
                                            width: '50%',
                                        }}
                                    >
                                        {intl.formatMessage({
                                            id: 'row.actions.extra.confirmation.header1',
                                        })}
                                    </Typography>

                                    <Typography
                                        component="span"
                                        style={{
                                            fontWeight: 500,
                                            width: '50%',
                                        }}
                                    >
                                        {intl.formatMessage({
                                            id: 'row.actions.extra.confirmation.header2',
                                        })}
                                    </Typography>
                                </Stack>
                            </ListItem>
                            <Divider />
                            {potentiallyDangerousUpdates.map((item) => {
                                return (
                                    <>
                                        {renderListItems(item)}
                                        <Divider />
                                    </>
                                );
                            })}
                        </List>
                    </Stack>
                </AlertBox>
            ) : null}
        </>
    );
}

export default RowActionConfirmation;
