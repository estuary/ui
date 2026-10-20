import type { Ref } from 'react';
import type {
    DataPlaneChoice,
    PublicDataPlane,
} from 'src/components/onboarding/DataPlanePicker/dataPlaneMetadata';

import { useMemo } from 'react';

import {
    Box,
    ListSubheader,
    MenuItem,
    outlinedInputClasses,
    Select,
    Stack,
    Typography,
} from '@mui/material';

import { Check, NavArrowDown } from 'iconoir-react';

import { CountryFlag } from 'src/components/onboarding/DataPlanePicker/CountryFlag';
import { groupDataPlanes } from 'src/components/onboarding/DataPlanePicker/dataPlaneMetadata';
import DataPlaneIcon from 'src/components/shared/Entity/DataPlaneIcon';

interface DataPlanePickerProps {
    dataPlanes: readonly PublicDataPlane[];
    onChange: (value: string) => void;
    value: string;
    disabled?: boolean;
    id?: string;
    inputRef?: Ref<unknown>;
    labelId?: string;
    loading?: boolean;
    name?: string;
    onBlur?: () => void;
}

const RegionCode = ({ choice }: { choice: DataPlaneChoice }) => (
    <Typography
        component="span"
        sx={{
            fontFamily: 'monospace',
            fontSize: 12,
            color: 'text.secondary',
            whiteSpace: 'nowrap',
        }}
    >
        {choice.plane.region}
        {choice.disambiguator ? ` · ${choice.disambiguator}` : null}
    </Typography>
);

const ChoiceIcons = ({ choice }: { choice: DataPlaneChoice }) => (
    <>
        <DataPlaneIcon
            provider={choice.plane.cloudProvider}
            scope="public"
            hideScopeIcon
        />
        <CountryFlag country={choice.country} />
    </>
);

// Sized to 1em so MUI's `.MuiSelect-icon` centering and open-state rotation
// apply as they do to its own icon.
const ChevronIcon = ({ className }: { className?: string }) => (
    <NavArrowDown
        className={className}
        width="1em"
        height="1em"
        style={{ fontSize: 20 }}
    />
);

export const DataPlanePicker = ({
    dataPlanes,
    disabled,
    id,
    inputRef,
    labelId,
    loading,
    name,
    onBlur,
    onChange,
    value,
}: DataPlanePickerProps) => {
    const groups = useMemo(() => groupDataPlanes(dataPlanes), [dataPlanes]);

    const choicesByName = useMemo(
        () =>
            new Map(
                groups.flatMap(({ choices }) =>
                    choices.map((choice) => [choice.plane.name, choice])
                )
            ),
        [groups]
    );

    const selectedChoice = choicesByName.get(value);

    return (
        <Select
            id={id}
            name={name}
            inputRef={inputRef}
            labelId={labelId}
            value={selectedChoice ? value : ''}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onBlur}
            disabled={disabled}
            displayEmpty
            IconComponent={ChevronIcon}
            variant="outlined"
            renderValue={() =>
                selectedChoice ? (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <ChoiceIcons choice={selectedChoice} />
                        <Typography component="span" noWrap>
                            {selectedChoice.label}
                        </Typography>
                        <RegionCode choice={selectedChoice} />
                    </Stack>
                ) : (
                    <Typography component="span" color="text.secondary">
                        {loading
                            ? 'Loading data planes…'
                            : 'Select a data plane'}
                    </Typography>
                )
            }
            MenuProps={{
                slotProps: {
                    paper: { sx: { mt: 0.5 } },
                    list: { sx: { py: 0 } },
                },
            }}
            sx={{
                bgcolor: 'background.default',
                borderRadius: 3,
                [`& .${outlinedInputClasses.input}`]: {
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: 24,
                    py: 1.25,
                },
                // Borderless at rest, like the other onboarding fields; MUI's
                // primary focus outline shows while focused or open.
                [`&:not(.${outlinedInputClasses.focused}) .${outlinedInputClasses.notchedOutline}`]:
                    { borderColor: 'transparent' },
            }}
        >
            {groups.flatMap((group, index) => [
                <ListSubheader
                    key={`group-${group.provider}`}
                    sx={{
                        pt: 1.5,
                        pb: 0.5,
                        lineHeight: 1.5,
                        fontSize: 11,
                        fontWeight: 500,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'text.secondary',
                        borderTop: index > 0 ? 1 : 0,
                        borderColor: 'divider',
                        // The sticky header paints its own background; in dark
                        // mode, match the menu paper's elevation overlay.
                        backgroundImage: 'var(--Paper-overlay)',
                    }}
                >
                    {group.label}
                </ListSubheader>,
                ...group.choices.map((choice) => (
                    <MenuItem
                        key={choice.plane.name}
                        value={choice.plane.name}
                        sx={{
                            'gap': 1.5,
                            'py': 1,
                            '&.Mui-selected': { bgcolor: 'primary.alpha_12' },
                            '&.Mui-selected:hover, &.Mui-selected.Mui-focusVisible':
                                { bgcolor: 'primary.alpha_26' },
                        }}
                    >
                        <ChoiceIcons choice={choice} />
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography noWrap>{choice.label}</Typography>
                            <RegionCode choice={choice} />
                        </Box>
                        {choice.plane.name === value ? (
                            <Box
                                component="span"
                                sx={{ display: 'flex', color: 'primary.main' }}
                            >
                                <Check width={18} height={18} />
                            </Box>
                        ) : null}
                    </MenuItem>
                )),
            ])}
        </Select>
    );
};
