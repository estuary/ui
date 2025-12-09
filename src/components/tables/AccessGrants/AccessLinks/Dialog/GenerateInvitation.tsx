import type { ReactNode } from 'react';
import type { GenerateInvitationProps } from 'src/components/tables/AccessGrants/AccessLinks/Dialog/types';
import type { SelectableTableStore } from 'src/stores/Tables/Store';

import { useRef, useState } from 'react';

import {
    Box,
    Button,
    Checkbox,
    Divider,
    FormControlLabel,
    Radio,
    RadioGroup,
    Stack,
    Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { useIntl } from 'react-intl';

import { generateGrantDirective } from 'src/api/directives';
import TechnicalEmphasis from 'src/components/derivation/Create/TechnicalEmphasis';
import PrefixedName from 'src/components/inputs/PrefixedName';
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
const MAX_PREFIX_LENGTH = 12;

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
            control={<Radio size="small" />}
            label={label}
            componentsProps={{
                typography: {
                    fontSize: 13,
                    width: '100%',
                    display: 'block',
                    overflow: 'hidden',
                },
            }}
            sx={{
                m: 0,
                px: 1,
                width: '100%',
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
        defaultPrefix: true,
    });

    const [capability, setCapability] = useState<string>(capabilityOptions[0]);
    const [reusability, setReusability] = useState<string>(typeOptions[0]);
    const [accessScope, setAccessScope] = useState<string | null>(null);
    const subPrefixInputRef = useRef<HTMLInputElement>(null);

    const limitedAccessScope = accessScope === 'limited';

    const elipsis = intl.formatMessage({ id: 'common.pathShort.prefix' });

    const clampedPrefix =
        prefix.length > MAX_PREFIX_LENGTH + elipsis.length + 1 // extra length for elipsis and slash
            ? prefix.slice(0, MAX_PREFIX_LENGTH) + elipsis
            : prefix;

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

            const objectRole = `${prefix}${limitedAccessScope ? name : ''}`;
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

    const onChange = (value: string, errors: string | null) => {
        if (serverError) {
            setServerError(null);
        }

        prefixHandlers.setPrefix(value);
    };

    return (
        <Stack sx={{ mb: 2 }} spacing={1}>
            <Stack spacing={1} sx={{ pt: 1 }}>
                <Stack spacing={1} direction="row">
                    <Box sx={{ flex: 1 }}>
                        <PrefixedName
                            prefixOnly
                            defaultPrefix
                            disabled={objectRoles?.length === 1}
                            label={intl.formatMessage({
                                id: 'admin.users.prefixInvitation.label.tenant',
                            })}
                            onChange={onChange}
                        />
                    </Box>
                    <Box sx={{ minWidth: 150 }}>
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
                </Stack>

                <RadioGroup
                    sx={{
                        gap: 1,
                    }}
                    value={accessScope}
                    onChange={(event) => setAccessScope(event.target.value)}
                >
                    <RadioOption
                        value="full"
                        isSelected={accessScope === 'full'}
                        label={
                            <Stack
                                direction="row"
                                spacing={0.5}
                                component="span"
                                alignItems="center"
                                sx={{ lineHeight: 1 }}
                            >
                                <Typography
                                    component="span"
                                    sx={{
                                        lineHeight: 'inherit',
                                        flexShrink: 0,
                                    }}
                                >
                                    {intl.formatMessage({
                                        id: 'admin.users.prefixInvitation.label.scope.full',
                                    })}
                                </Typography>
                                <TechnicalEmphasis
                                    noWrap
                                    sx={{ lineHeight: 'inherit' }}
                                >
                                    {prefix}
                                </TechnicalEmphasis>
                            </Stack>
                        }
                    />
                    <RadioOption
                        value="limited"
                        isSelected={limitedAccessScope}
                        onClick={() => {
                            if (!limitedAccessScope && !hasLength(name)) {
                                // Focus the name input when switching to limited scope IF the name is empty
                                // (and not if the value is already defined to avoid unintentional edits)
                                setTimeout(() => {
                                    subPrefixInputRef.current?.focus();
                                }, 0);
                            }
                        }}
                        label={
                            <Stack
                                spacing={0.5}
                                direction="row"
                                alignItems="center"
                                sx={{ lineHeight: 1 }}
                            >
                                <Typography
                                    noWrap
                                    component="span"
                                    sx={{ lineHeight: 'inherit' }}
                                >
                                    {intl.formatMessage({
                                        id: 'admin.users.prefixInvitation.label.scope.limited',
                                    })}
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'inline-flex',
                                        ml: -0.5,
                                        flex: 1,
                                    }}
                                >
                                    <TechnicalEmphasis
                                        sx={{
                                            color: palette.text.disabled,
                                        }}
                                    >
                                        {clampedPrefix}
                                    </TechnicalEmphasis>
                                    <input
                                        ref={subPrefixInputRef}
                                        value={name}
                                        placeholder="example"
                                        disabled={!limitedAccessScope}
                                        onChange={(event) => {
                                            prefixHandlers.setName(
                                                event.target.value
                                            );
                                        }}
                                        style={{
                                            marginBottom: 1,
                                            marginLeft: -2,
                                            border: 'none',
                                            outline: 'none',
                                            fontFamily: 'monospace',
                                            fontSize: 'inherit',
                                            backgroundColor: 'transparent',
                                            width: '100%',
                                            color:
                                                nameError && hasLength(name)
                                                    ? palette.error.main
                                                    : !limitedAccessScope
                                                      ? palette.text.disabled
                                                      : palette.text.primary,
                                        }}
                                    />
                                </Box>
                            </Stack>
                        }
                    />
                </RadioGroup>
                {limitedAccessScope && hasLength(name) && hasLength(errors) ? (
                    <Typography
                        color="error.main"
                        fontSize={12}
                        sx={{
                            textAlign: 'right',
                        }}
                    >
                        {errors}
                    </Typography>
                ) : null}
            </Stack>
            <Stack spacing={2} direction="row" sx={{ alignSelf: 'flex-end' }}>
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
                        (limitedAccessScope &&
                            (hasLength(nameError) || !hasLength(name)))
                    }
                    onClick={handlers.generateInvitation}
                >
                    {intl.formatMessage({
                        id: 'admin.users.prefixInvitation.cta.generateLink',
                    })}
                </Button>
            </Stack>
            <Divider />
        </Stack>
    );
}

export default GenerateInvitation;
