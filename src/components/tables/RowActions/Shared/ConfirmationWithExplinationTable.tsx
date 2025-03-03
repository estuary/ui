import { Box, Divider, List, ListItem, Stack, Typography } from '@mui/material';
import MessageWithLink from 'components/content/MessageWithLink';
import AlertBox from 'components/shared/AlertBox';
import { alertColorsReversed } from 'context/Theme';
import { WarningTriangle } from 'iconoir-react';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { AccessGrantRowConfirmation } from '../AccessGrants/types';
import { ConfirmationWithExplinationTableProps } from './types';

const leftSideWidth = '50%';
const rightSideWidth = '50%';

function ConfirmationWithExplinationTable({
    message,
    selected,
}: ConfirmationWithExplinationTableProps) {
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

    const renderListItems = (
        item: AccessGrantRowConfirmation,
        index: number
    ) => (
        <ListItem
            component="div"
            key={`confirmation-selected-items-${item.message}-${index}`}
        >
            <Stack direction="row" style={{ width: '100%' }}>
                <Typography
                    component="div"
                    style={{
                        width: leftSideWidth,
                    }}
                >
                    {item.message}
                </Typography>

                {!item.details ? null : (
                    <Stack
                        component="span"
                        direction="row"
                        spacing={1}
                        sx={{
                            alignItems: 'center',
                            width: rightSideWidth,
                            color:
                                item.details[0] === 'dangerous'
                                    ? (theme) =>
                                          alertColorsReversed.warning[
                                              theme.palette.mode
                                          ]
                                    : undefined,
                        }}
                    >
                        <Typography>
                            {item.details[0] === 'dangerous' ? (
                                <WarningTriangle />
                            ) : null}
                        </Typography>
                        <Typography
                            sx={{
                                fontWeight:
                                    item.details[0] === 'dangerous'
                                        ? 500
                                        : undefined,
                            }}
                        >
                            {item.details[1]}
                        </Typography>
                    </Stack>
                )}
            </Stack>
        </ListItem>
    );

    return (
        <Box>
            {potentiallyDangerousUpdates.length > 0 ? (
                <AlertBox
                    short={false}
                    sx={{
                        my: 1,
                        p: 3,
                    }}
                    headerMessage={intl.formatMessage({
                        id: 'accessGrants.actions.extra.confirmation.title',
                    })}
                    severity="warning"
                >
                    <Typography component="div">
                        <MessageWithLink messageID="accessGrants.actions.extra.confirmation.instructions" />
                    </Typography>
                </AlertBox>
            ) : (
                message
            )}

            <List component="div" sx={{ ml: 2 }}>
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
                                id: 'accessGrants.actions.extra.confirmation.header1',
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
                                id: 'accessGrants.actions.extra.confirmation.header2',
                            })}
                        </Typography>
                    </Stack>
                </ListItem>
                <Divider sx={{ borderWidth: 2 }} />

                {normalUpdates.map((item, index) => {
                    return (
                        <>
                            {renderListItems(item, index)}
                            {index !== normalUpdates.length - 1 ? (
                                <Divider />
                            ) : null}
                        </>
                    );
                })}
                {potentiallyDangerousUpdates.length > 0 ? (
                    <>
                        <Divider sx={{ borderWidth: 1.5 }} />
                        {potentiallyDangerousUpdates.map((item, index) => {
                            return (
                                <>
                                    {renderListItems(item, index)}
                                    <Divider />
                                </>
                            );
                        })}
                    </>
                ) : null}
            </List>
        </Box>
    );
}

export default ConfirmationWithExplinationTable;
