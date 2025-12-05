import type { GenerateInvitationProps } from 'src/components/tables/AccessGrants/AccessLinks/Dialog/types';
import type { SelectableTableStore } from 'src/stores/Tables/Store';

import { ReactNode, useMemo, useRef, useState } from 'react';

import {
    Box,
    Button,
    Checkbox,
    Divider,
    FormControlLabel,
    Radio,
    RadioGroup,
    Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { useIntl } from 'react-intl';

import { generateGrantDirective } from 'src/api/directives';
import PrefixedName from 'src/components/inputs/PrefixedName';
import PrefixSelector from 'src/components/inputs/PrefixedName/PrefixSelector';
import useValidatePrefix from 'src/components/inputs/PrefixedName/useValidatePrefix';
import AutocompletedField from 'src/components/shared/toolbar/AutocompletedField';
import { useZustandStore } from 'src/context/Zustand/provider';
import { SelectTableStoreNames } from 'src/stores/names';
import { selectableTableStoreSelectors } from 'src/stores/Tables/Store';
import { appendWithForwardSlash, hasLength } from 'src/utils/misc-utils';

// The write capability should be obscured to the user. It is more challenging
// for a user to understand the nuances of this grant and likely will not be used
// outside of advanced cases.
const capabilityOptions = ['admin', 'read'];
const typeOptions = ['single-use', 'multi-use'];
const INPUT_ID = 'prefixed-name-input';

const RadioOption = ({
    value,
    label,
    isSelected,
    onClick,
}: {
    value: string;
    label: ReactNode;
    isSelected: boolean;
    onClick?: () => void;
}) => {
    return (
        <FormControlLabel
            value={value}
            control={
                <Radio
                    size="small"
                    sx={{
                        '&.MuiRadio-root:hover': {
                            bgcolor: 'transparent !important',
                        },
                    }}
                />
            }
            label={label}
            componentsProps={{
                typography: { fontSize: 13, width: '100%' },
            }}
            sx={{
                m: 0,
                px: 1,
                border: '1px solid',
                borderColor: isSelected ? 'primary.main' : 'divider',
                borderRadius: 3,
                ...(!isSelected && {
                    '&:hover': {
                        backgroundColor: 'action.hover',
                    },
                }),
            }}
            onClick={onClick}
        />
    );
};

function GenerateInvitation({
    serverError,
    setServerError,
}: GenerateInvitationProps) {
    const intl = useIntl();
    const { palette } = useTheme();

    const hydrate = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['hydrate']
    >(
        SelectTableStoreNames.ACCESS_GRANTS_LINKS,
        selectableTableStoreSelectors.query.hydrate
    );

    const {
        handlers: prefixHandlers,
        name,
        nameError,
        objectRoles,
        errors,
        prefix,
    } = useValidatePrefix({
        allowBlankName: false,
        allowEndSlash: true,
    });

    const [capability, setCapability] = useState<string>(capabilityOptions[0]);
    const [reusability, setReusability] = useState<string>(typeOptions[0]);
    const [accessScope, setAccessScope] = useState<string | null>(null);
    const subPrefixInputRef = useRef<HTMLInputElement>(null);

    const handlers = {
        setGrantCapability: (_event: React.SyntheticEvent, value: string) => {
            if (serverError) {
                setServerError(null);
            }

            setCapability(value);
        },
        setGrantReusability: (_event: React.SyntheticEvent, value: string) => {
            if (serverError) {
                setServerError(null);
            }

            setReusability(value);
        },
        generateInvitation: (event: React.MouseEvent<HTMLElement>) => {
            event.preventDefault();

            const objectRole = prefix + name;
            const processedObject = appendWithForwardSlash(objectRole);

            generateGrantDirective(
                processedObject,
                capability,
                reusability === 'single-use'
            ).then(
                (response) => {
                    if (response.error) {
                        setServerError(response.error);
                    } else if (hasLength(response.data)) {
                        if (serverError) {
                            setServerError(null);
                        }

                        hydrate();
                    }
                },
                (error) => setServerError(error)
            );
        },
    };

    return (
        <Box
            sx={{
                mb: 2,
                display: 'flex',
                gap: 2,
                flexDirection: 'column',
            }}
        >
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        minWidth: 180,
                    }}
                >
                    <Box sx={{ pt: 1 }}>
                        <PrefixedName
                            prefixOnly
                            disabled={objectRoles?.length == 1}
                            label={intl.formatMessage({
                                id: 'admin.users.prefixInvitation.label.tenant',
                            })}
                        />
                    </Box>

                    <AutocompletedField
                        label={intl.formatMessage({
                            id: 'admin.users.prefixInvitation.label.capability',
                        })}
                        required
                        options={capabilityOptions}
                        defaultValue={capabilityOptions[0]}
                        changeHandler={handlers.setGrantCapability}
                    />
                </Box>

                <Divider flexItem orientation="vertical" />

                <Box sx={{ flex: 1 }}>
                    <RadioGroup
                        sx={{
                            pt: 1,
                            gap: 1.5,
                        }}
                        value={accessScope}
                        onChange={(event) => setAccessScope(event.target.value)}
                    >
                        <RadioOption
                            value="full"
                            isSelected={accessScope === 'full'}
                            label={
                                <span>
                                    {intl.formatMessage({
                                        id: 'admin.users.prefixInvitation.label.scope.full',
                                    })}
                                    <span
                                        style={{
                                            fontFamily: 'monospace',
                                            fontSize: 12,
                                        }}
                                    >
                                        {prefix}
                                    </span>
                                </span>
                            }
                        />
                        <RadioOption
                            value="limited"
                            isSelected={accessScope === 'limited'}
                            onClick={() => {
                                if (
                                    accessScope !== 'limited' &&
                                    !hasLength(name)
                                ) {
                                    setTimeout(() => {
                                        subPrefixInputRef.current?.focus();
                                    }, 0);
                                }
                            }}
                            label={
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 0.5,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                        }}
                                    >
                                        <span>
                                            {intl.formatMessage({
                                                id: 'admin.users.prefixInvitation.label.scope.limited',
                                            })}
                                        </span>
                                        <Box
                                            sx={{
                                                display: 'inline-flex',
                                                mt: 0.2,
                                                ml: -0.5,
                                                flex: 1,
                                            }}
                                        >
                                            <Typography
                                                component="span"
                                                sx={{
                                                    fontFamily: 'monospace',
                                                    fontSize: 12,
                                                }}
                                            >
                                                {prefix}
                                            </Typography>
                                            <input
                                                ref={subPrefixInputRef}
                                                value={name}
                                                placeholder="example"
                                                disabled={
                                                    accessScope !== 'limited'
                                                }
                                                onChange={(event) => {
                                                    prefixHandlers.setName(
                                                        event.target.value
                                                    );
                                                }}
                                                style={{
                                                    border: 'none',
                                                    outline: 'none',
                                                    fontFamily: 'monospace',
                                                    fontSize: 12,
                                                    backgroundColor:
                                                        'transparent',
                                                    width: '100%',
                                                    color:
                                                        accessScope !==
                                                        'limited'
                                                            ? palette.text
                                                                  .disabled
                                                            : nameError &&
                                                                hasLength(name)
                                                              ? palette.error
                                                                    .main
                                                              : palette.text
                                                                    .primary,
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                            }
                        />
                    </RadioGroup>
                    {accessScope == 'limited' && hasLength(name) && (
                        <Typography
                            color={'error.main'}
                            fontSize={12}
                            sx={{
                                textAlign: 'right',
                            }}
                        >
                            {errors}
                        </Typography>
                    )}
                </Box>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    marginLeft: 'auto',
                    gap: 1,
                }}
            >
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={reusability === 'multi-use'}
                            onChange={(event) => {
                                handlers.setGrantReusability(
                                    event,
                                    event.target.checked
                                        ? 'multi-use'
                                        : 'single-use'
                                );
                            }}
                        />
                    }
                    label={intl.formatMessage({
                        id: 'admin.users.prefixInvitation.label.reusable',
                    })}
                    componentsProps={{
                        typography: { fontSize: 12 },
                    }}
                />
                <Button
                    disabled={
                        accessScope === null ||
                        (accessScope === 'limited' &&
                            (hasLength(nameError) || !hasLength(name)))
                    }
                    onClick={handlers.generateInvitation}
                >
                    {intl.formatMessage({
                        id: 'admin.users.prefixInvitation.cta.generateLink',
                    })}
                </Button>
            </Box>
            <Divider orientation="horizontal" />
        </Box>
    );
}

export default GenerateInvitation;
