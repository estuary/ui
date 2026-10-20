import type { Theme } from '@mui/material';
import type { Ref } from 'react';
import type {
    DataPlaneChoice,
    PublicDataPlane,
} from 'src/components/onboarding/DataPlanePicker/dataPlaneMetadata';

import { useMemo, useState } from 'react';

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

// Neutral grey for the provider headers and region codes. `text.secondary`
// is navy in light mode, and `text.disabled` is too faint for text people
// need to read.
const mutedText = (theme: Theme) =>
    theme.palette.grey[theme.palette.mode === 'light' ? 700 : 500];

const NAME_SX = { fontSize: 15, lineHeight: 1.35 };

const RegionCode = ({ choice }: { choice: DataPlaneChoice }) => (
    <Typography
        component="span"
        sx={{
            display: 'block',
            fontFamily: 'monospace',
            fontSize: 12,
            lineHeight: 1.35,
            color: mutedText,
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

// The menu opens below the field, as in the design, and scrolls when the
// space below is short. MUI would otherwise shift it up over the field.
// Below this height, let MUI reposition it instead.
const MIN_MENU_HEIGHT = 240;
const MENU_VIEWPORT_GUTTER = 16;

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
    const [menuMaxHeight, setMenuMaxHeight] = useState<number>();

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
            onOpen={(event) => {
                const { bottom } = (
                    event.currentTarget as HTMLElement
                ).getBoundingClientRect();

                setMenuMaxHeight(
                    Math.max(
                        MIN_MENU_HEIGHT,
                        window.innerHeight - bottom - MENU_VIEWPORT_GUTTER
                    )
                );
            }}
            disabled={disabled}
            displayEmpty
            IconComponent={ChevronIcon}
            variant="outlined"
            renderValue={() =>
                selectedChoice ? (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <ChoiceIcons choice={selectedChoice} />
                        <Typography component="span" noWrap sx={NAME_SX}>
                            {selectedChoice.label}
                        </Typography>
                        <RegionCode choice={selectedChoice} />
                    </Stack>
                ) : (
                    <Typography component="span" sx={NAME_SX}>
                        {loading
                            ? 'Loading data planes…'
                            : 'Select a data plane'}
                    </Typography>
                )
            }
            MenuProps={{
                slotProps: {
                    paper: { sx: { maxHeight: menuMaxHeight } },
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
                    py: 1.5,
                    // Lines the closed field's icons up with the options'.
                    pl: 2,
                },
                [`&.${outlinedInputClasses.focused}`]: {
                    bgcolor: 'background.paper',
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
                        lineHeight: 1.4,
                        fontSize: 12,
                        fontWeight: 500,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: mutedText,
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
                            'py': 0.75,
                            '&.Mui-selected': { bgcolor: 'primary.alpha_12' },
                            '&.Mui-selected:hover, &.Mui-selected.Mui-focusVisible':
                                { bgcolor: 'primary.alpha_26' },
                        }}
                    >
                        <ChoiceIcons choice={choice} />
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography noWrap sx={NAME_SX}>
                                {choice.label}
                            </Typography>
                            <RegionCode choice={choice} />
                        </Box>
                        {choice.plane.name === value ? (
                            <Box
                                component="span"
                                sx={{ display: 'flex', color: 'primary.main' }}
                            >
                                <Check width={18} height={18} strokeWidth={2} />
                            </Box>
                        ) : null}
                    </MenuItem>
                )),
            ])}
        </Select>
    );
};
