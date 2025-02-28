import { Box, Divider, List, ListItem, Stack, Typography } from '@mui/material';
import MessageWithLink from 'components/content/MessageWithLink';
import { alertColorsReversed } from 'context/Theme';
import { AccessGrantRemovalDescription } from 'hooks/useAccessGrantRemovalDescriptions';
import { ReactNode, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { SelectTableStoreNames } from 'stores/names';
import { RowConfirmation } from '../AccessGrants/types';
import NestedListItem, { SettingMetadata } from './NestedListItem';

interface RowActionConfirmationProps {
    message: ReactNode;
    selected: RowConfirmation<AccessGrantRemovalDescription>[]; //SelectableTableStore['selected'];
    selectableTableStoreName?:
        | SelectTableStoreNames.CAPTURE
        | SelectTableStoreNames.COLLECTION
        | SelectTableStoreNames.ENTITY_SELECTOR
        | SelectTableStoreNames.MATERIALIZATION;
    settings?: SettingMetadata[];
}

const leftSideWidth = '60%';
const rightSideWidth = '40%';

function RowActionConfirmation({
    message,
    selected,
    selectableTableStoreName,
    settings,
}: RowActionConfirmationProps) {
    const intl = useIntl();

    const potentiallyDangerousUpdates = useMemo(
        () =>
            selected.filter(
                ({ details }) => details && details[0] === 'dangerous'
            ),
        [selected]
    );

    const normalUpdates = useMemo(
        () =>
            selected.filter(
                ({ details }) => details && details[0] === 'normal'
            ),
        [selected]
    );

    const renderListItems =
        settings && settings.length > 0 && selectableTableStoreName
            ? (
                  item: RowConfirmation<AccessGrantRemovalDescription>,
                  index: number
              ) => (
                  <NestedListItem
                      key={`confirmation-selected-items-${item.message}-${index}`}
                      catalogName={item.message}
                      selectableTableStoreName={selectableTableStoreName}
                      settings={settings}
                  />
              )
            : (
                  item: RowConfirmation<AccessGrantRemovalDescription>,
                  index: number
              ) => (
                  <ListItem
                      component="div"
                      key={`confirmation-selected-items-${item.message}-${index}`}
                  >
                      <Stack direction="row" style={{ width: '100%' }}>
                          <Typography
                              component="span"
                              style={{ width: leftSideWidth }}
                          >
                              {item.message}
                          </Typography>

                          {!item.details ? null : (
                              <Typography
                                  component="span"
                                  sx={{
                                      fontWeight: 500,
                                      width: rightSideWidth,
                                      color:
                                          item.details[0] === 'dangerous'
                                              ? (theme) =>
                                                    alertColorsReversed.error[
                                                        theme.palette.mode
                                                    ]
                                              : undefined,
                                  }}
                              >
                                  {item.details[1]}
                              </Typography>
                          )}
                      </Stack>
                  </ListItem>
              );

    return (
        <>
            {normalUpdates.length > 0 ? (
                <Box sx={{ ml: 2 }}>
                    {message}
                    <List component="div">
                        <ListItem component="div" key="normal-action-header">
                            <Stack direction="row" style={{ width: '100%' }}>
                                <Typography
                                    component="span"
                                    style={{
                                        fontWeight: 500,
                                        width: leftSideWidth,
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
                                        width: rightSideWidth,
                                    }}
                                >
                                    {intl.formatMessage({
                                        id: 'row.actions.extra.confirmation.header2',
                                    })}
                                </Typography>
                            </Stack>
                        </ListItem>
                        <Divider />
                        {normalUpdates.map((item, index) => {
                            return (
                                <>
                                    {renderListItems(item, index)}
                                    <Divider />
                                </>
                            );
                        })}
                    </List>
                </Box>
            ) : null}

            {potentiallyDangerousUpdates.length > 0 ? (
                <>
                    <Typography variant="h6">
                        {intl.formatMessage({
                            id: 'row.actions.extra.confirmation.title',
                        })}
                    </Typography>
                    <Box
                        sx={{
                            border: '1px solid',
                            borderColor: (theme) =>
                                alertColorsReversed.error[theme.palette.mode],
                            p: 2,
                        }}
                    >
                        <Stack spacing={1}>
                            <Typography component="div">
                                {intl.formatMessage({
                                    id: 'row.actions.extra.confirmation.message',
                                })}
                            </Typography>
                            <Typography component="div">
                                <MessageWithLink messageID="row.actions.extra.confirmation.instructions" />
                            </Typography>

                            <List component="div">
                                <ListItem
                                    component="div"
                                    key="dangerous-action-header"
                                >
                                    <Stack
                                        direction="row"
                                        style={{ width: '100%' }}
                                    >
                                        <Typography
                                            component="span"
                                            style={{
                                                fontWeight: 500,
                                                width: leftSideWidth,
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
                                                width: rightSideWidth,
                                            }}
                                        >
                                            {intl.formatMessage({
                                                id: 'row.actions.extra.confirmation.header2',
                                            })}
                                        </Typography>
                                    </Stack>
                                </ListItem>
                                <Divider />
                                {potentiallyDangerousUpdates.map(
                                    (item, index) => {
                                        return (
                                            <>
                                                {renderListItems(item, index)}
                                                <Divider />
                                            </>
                                        );
                                    }
                                )}
                            </List>
                        </Stack>
                    </Box>
                </>
            ) : null}
        </>
    );
}

export default RowActionConfirmation;
