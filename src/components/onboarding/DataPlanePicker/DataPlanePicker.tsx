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

import { Check, Cloud } from 'iconoir-react';

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

// The generic `monospace` alone resolves to Courier in Chrome on macOS.
const MONOSPACE_FONT = [
    'ui-monospace',
    'SFMono-Regular',
    'Menlo',
    'Consolas',
    '"Liberation Mono"',
    'monospace',
].join(',');

const RegionCode = ({ choice }: { choice: DataPlaneChoice }) => (
    <Typography
        component="span"
        sx={{
            display: 'block',
            fontFamily: MONOSPACE_FONT,
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
        {choice.providerKnown ? (
            <DataPlaneIcon
                provider={choice.plane.cloudProvider}
                scope="public"
                hideScopeIcon
            />
        ) : (
            // A neutral cloud rather than DataPlaneIcon's question mark.
            <Box
                component="span"
                sx={{ display: 'flex', flexShrink: 0, color: mutedText }}
            >
                <Cloud width={20} height={20} />
            </Box>
        )}
        <CountryFlag country={choice.country} />
    </>
);

// The menu opens below the field, as in the design, and scrolls when the
// space below is short. MUI would otherwise shift it up over the field.
// Below this height, let MUI reposition it instead.
const MIN_MENU_HEIGHT = 240;
const MENU_VIEWPORT_GUTTER = 16;

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
            size="small"
            variant="outlined"
            renderValue={() =>
                selectedChoice ? (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <ChoiceIcons choice={selectedChoice} />
                        <Typography component="span" variant="inherit" noWrap>
                            {selectedChoice.label}
                        </Typography>
                        <RegionCode choice={selectedChoice} />
                    </Stack>
                ) : (
                    // Styled like MUI's input placeholder, as on the
                    // Organization Name field.
                    <Typography
                        component="span"
                        variant="inherit"
                        sx={{
                            opacity: (theme) =>
                                theme.palette.mode === 'light' ? 0.42 : 0.5,
                        }}
                    >
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
                'bgcolor': 'background.default',
                'borderRadius': 3,
                // Laid out as a row so the icons sit beside the name.
                [`& .${outlinedInputClasses.input}`]: {
                    display: 'flex',
                    alignItems: 'center',
                },
                // Borderless in every state, like the Organization Name field.
                '& fieldset': { border: 'none' },
            }}
        >
            {groups.flatMap((group, index) => [
                <ListSubheader
                    key={`group-${group.provider}`}
                    sx={{
                        pt: 1.5,
                        pb: 0.5,
                        lineHeight: 1.4,
                        // Sentence case, smaller and bolder than the option
                        // names and in muted grey, so it reads as a label.
                        fontSize: 13,
                        fontWeight: 600,
                        letterSpacing: '0.01em',
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
