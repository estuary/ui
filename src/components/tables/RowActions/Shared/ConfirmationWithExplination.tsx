import { Box, Divider, List, ListItem, Stack, Typography } from '@mui/material';
import MessageWithLink from 'components/content/MessageWithLink';
import AlertBox from 'components/shared/AlertBox';
import { alertColorsReversed } from 'context/Theme';
import { AccessGrantRemovalType } from 'hooks/useAccessGrantRemovalDescriptions';
import { WarningTriangle } from 'iconoir-react';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { AccessGrantRowConfirmation } from '../AccessGrants/types';
import { ConfirmationWithExplinationProps } from './types';

const leftSideWidth = '50%';
const rightSideWidth = '50%';

function ConfirmationWithExplination({
    message,
    selected,
}: ConfirmationWithExplinationProps) {
    const intl = useIntl();

    const { dangerous: potentiallyDangerousUpdates, normal: normalUpdates } =
        useMemo(() => {
            const response: {
                [k in AccessGrantRemovalType]: AccessGrantRowConfirmation[];
            } = {
                dangerous: [],
                normal: [],
            };

            selected.forEach((datum) => {
                response[datum.details[0]].push(datum);
            });

            return response;
        }, [selected]);

    const renderListItems = (
        item: AccessGrantRowConfirmation,
        index: number
    ) => {
        const dangerous = item.details[0] === 'dangerous';
        return (
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

                    <Stack
                        component="span"
                        direction="row"
                        spacing={1}
                        sx={{
                            alignItems: 'center',
                            width: rightSideWidth,
                            color: dangerous
                                ? (theme) =>
                                      alertColorsReversed.warning[
                                          theme.palette.mode
                                      ]
                                : undefined,
                        }}
                    >
                        <Typography>
                            {dangerous ? <WarningTriangle /> : null}
                        </Typography>
                        <Typography
                            sx={{
                                fontWeight: dangerous ? 500 : undefined,
                            }}
                        >
                            {item.details[1]}
                        </Typography>
                    </Stack>
                </Stack>
            </ListItem>
        );
    };

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
                <ListItem
                    component="div"
                    key="confirmation-explination-table-header"
                >
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

export default ConfirmationWithExplination;
