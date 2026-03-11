import type { Capability } from '@estuary/graphql-schema';
import type { Dispatch, ReactNode, SetStateAction } from 'react';

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
import { CombinedError } from 'urql';

import { useCreateInviteLink } from 'src/api/gql/inviteLinks';
import TechnicalEmphasis from 'src/components/derivation/Create/TechnicalEmphasis';
import PrefixedName from 'src/components/inputs/PrefixedName';
import useValidatePrefix from 'src/components/inputs/PrefixedName/useValidatePrefix';
import AutocompletedField from 'src/components/shared/toolbar/AutocompletedField';
import { appendWithForwardSlash, hasLength } from 'src/utils/misc-utils';

interface GenerateInvitationProps {
    serverError: CombinedError | null;
    setServerError: Dispatch<SetStateAction<CombinedError | null>>;
    prefix: string;
    onCreated: () => void;
}
// The write capability should be obscured to the user. It is more challenging
// for a user to understand the nuances of this grant and likely will not be used
// outside of advanced cases.
const capabilityOptions: Capability[] = ['admin', 'read'];
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
    onCreated,
}: GenerateInvitationProps) {
    const intl = useIntl();
    const { palette } = useTheme();

    const [, createInviteLink] = useCreateInviteLink();

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

    const [capability, setCapability] = useState<Capability>(
        capabilityOptions[0]
    );
    const [singleUse, setSingleUse] = useState(true);
    const [accessScope, setAccessScope] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
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

            setCapability(value as Capability);
        },
        generateInvitation: async (event: React.MouseEvent<HTMLElement>) => {
            event.preventDefault();

            const objectRole = `${prefix}${limitedAccessScope ? name : ''}`;
            const catalogPrefix = appendWithForwardSlash(objectRole);

            setSaving(true);

            const result = await createInviteLink({
                catalogPrefix,
                capability,
                singleUse,
            });

            setSaving(false);

            if (result.error) {
                setServerError(result.error);
            } else {
                if (serverError) {
                    setServerError(null);
                }
                onCreated();
            }
        },
    };

    const onChange = (value: string, _errors: string | null) => {
        if (serverError) {
            setServerError(null);
        }

        prefixHandlers.setPrefix(value);
    };

    return (
        <Stack sx={{ mb: 2, minWidth: 500 }} spacing={1}>
            <Stack spacing={1} sx={{ pt: 1 }}>
                <Stack spacing={1} direction="row">
                    <Box sx={{ flex: 1 }}>
                        <PrefixedName
                            prefixOnly
                            defaultPrefix
                            disabled={objectRoles?.length === 1}
                            label={intl.formatMessage({
                                id: 'terms.tenant',
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
                            >
                                <Typography
                                    component="span"
                                    sx={{
                                        flexShrink: 0,
                                    }}
                                >
                                    {intl.formatMessage({
                                        id: 'admin.users.prefixInvitation.label.scope.full',
                                    })}
                                </Typography>
                                <TechnicalEmphasis noWrap>
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
                            >
                                <Typography noWrap component="span">
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
                                            whiteSpace: 'nowrap',
                                            color: palette.text.disabled,
                                        }}
                                    >
                                        {clampedPrefix}
                                    </TechnicalEmphasis>
                                    <input
                                        ref={subPrefixInputRef}
                                        value={name}
                                        placeholder="example"
                                        onChange={(event) => {
                                            prefixHandlers.setName(
                                                event.target.value
                                            );
                                        }}
                                        style={{
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
                                            pointerEvents: !limitedAccessScope
                                                ? 'none'
                                                : 'auto',
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
                            checked={!singleUse}
                            onChange={(event) => {
                                setSingleUse(!event.target.checked);
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
                        saving ||
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
