import type { AlertTypeSelectorProps } from 'src/components/admin/Settings/PrefixAlerts/types';

import {
    Checkbox,
    FormControl,
    FormControlLabel,
    List,
    ListItem,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';

import { Lock } from 'iconoir-react';
import { useIntl } from 'react-intl';

import useAlertSubscriptionsStore from 'src/components/admin/Settings/PrefixAlerts/useAlertSubscriptionsStore';
import { defaultOutline, diminishedTextColor } from 'src/context/Theme';

const AlertTypeSelector = ({
    options,
    subscription,
}: AlertTypeSelectorProps) => {
    const intl = useIntl();
    const theme = useTheme();

    const serverError = useAlertSubscriptionsStore(
        (state) => state.initializationError
    );
    const setSingleAlertType = useAlertSubscriptionsStore(
        (state) => state.setSingleAlertType
    );

    return (
        <Stack spacing={1}>
            <Typography style={{ fontWeight: 500 }}>
                {intl.formatMessage({
                    id: 'entityTable.data.alertTypes',
                })}
            </Typography>

            <List component="div" disablePadding>
                {options.map((option, index) => {
                    const { alertType, description, displayName, isSystem } =
                        option;
                    const alertTypes = subscription?.alertTypes ?? [];

                    return (
                        <ListItem
                            key={`${alertType}-${index}`}
                            dense
                            style={{
                                border: defaultOutline[theme.palette.mode],
                                borderRadius: '6px',
                                marginBottom: 6,
                            }}
                        >
                            <FormControl fullWidth>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={alertTypes.includes(
                                                alertType
                                            )}
                                            onChange={(event) => {
                                                setSingleAlertType(
                                                    option.alertType,
                                                    event.target.checked,
                                                    subscription?.catalogPrefix,
                                                    subscription?.email
                                                );
                                            }}
                                        />
                                    }
                                    disabled={Boolean(serverError)}
                                    label={
                                        <Stack>
                                            <Stack
                                                direction="row"
                                                style={{
                                                    justifyContent:
                                                        'space-between',
                                                    marginTop: 8,
                                                }}
                                            >
                                                <Typography
                                                    style={{
                                                        fontWeight: 500,
                                                        marginBottom: 4,
                                                        textTransform:
                                                            'capitalize',
                                                    }}
                                                >
                                                    {displayName}
                                                </Typography>

                                                {isSystem ? (
                                                    <Lock
                                                        style={{
                                                            color: diminishedTextColor[
                                                                theme.palette
                                                                    .mode
                                                            ],
                                                        }}
                                                    />
                                                ) : null}
                                            </Stack>

                                            {description ? (
                                                <Typography
                                                    sx={{
                                                        color: diminishedTextColor[
                                                            theme.palette.mode
                                                        ],
                                                        marginBottom: 1,
                                                    }}
                                                >
                                                    {description}
                                                </Typography>
                                            ) : null}
                                        </Stack>
                                    }
                                    slotProps={{
                                        typography: {
                                            component: 'div',
                                            width: '100%',
                                        },
                                    }}
                                    style={{ alignItems: 'flex-start' }}
                                />
                            </FormControl>
                        </ListItem>
                    );
                })}
            </List>
        </Stack>
    );
};

export default AlertTypeSelector;
