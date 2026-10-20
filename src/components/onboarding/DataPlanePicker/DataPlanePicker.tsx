import type { Theme } from '@mui/material';
import type { Ref } from 'react';
import type {
    DataPlaneChoice,
    PublicDataPlane,
} from 'src/components/onboarding/DataPlanePicker/dataPlaneMetadata';

import { useState } from 'react';

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

import {
    CountryFlag,
    useFlagsPreloaded,
} from 'src/components/onboarding/DataPlanePicker/CountryFlag';
import { groupDataPlanes } from 'src/components/onboarding/DataPlanePicker/dataPlaneMetadata';
import DataPlaneIcon from 'src/components/shared/Entity/DataPlaneIcon';
import { PROVIDER_LABELS } from 'src/utils/cloudRegions';

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

// `text.secondary` is navy in light mode.
const mutedText = (theme: Theme) =>
    theme.palette.grey[theme.palette.mode === 'light' ? 700 : 500];

// Bare `monospace` renders as Courier in Chrome on macOS.
const MONOSPACE_FONT = [
    'ui-monospace',
    'SFMono-Regular',
    'Menlo',
    'Consolas',
    '"Liberation Mono"',
    'monospace',
].join(',');

const MIN_MENU_HEIGHT = 240;
const MENU_VIEWPORT_GUTTER = 16;

const ChoiceDetail = ({ choice }: { choice: DataPlaneChoice }) =>
    choice.detail ? (
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
            {choice.detail}
        </Typography>
    ) : null;

const ChoiceIcons = ({ choice }: { choice: DataPlaneChoice }) => (
    <>
        {choice.plane.cloudProvider in PROVIDER_LABELS ? (
            <DataPlaneIcon
                provider={choice.plane.cloudProvider}
                scope="public"
                hideScopeIcon
            />
        ) : (
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

// Select stamps `role="option"` and click handlers onto every child, so the
// header takes only its own props.
const GroupHeader = ({
    divider,
    label,
}: {
    divider: boolean;
    label: string;
}) => (
    <ListSubheader
        role="none"
        sx={{
            pt: 1.5,
            pb: 0.5,
            lineHeight: 1.4,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.01em',
            color: mutedText,
            borderTop: divider ? 1 : 0,
            borderColor: 'divider',
            // Its opaque background would hide the menu's dark-mode overlay.
            backgroundImage: 'var(--Paper-overlay)',
        }}
    >
        {label}
    </ListSubheader>
);

// Keeps MenuList from focusing the header when the menu opens.
GroupHeader.muiSkipListHighlight = true;

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

    const groups = groupDataPlanes(dataPlanes);

    const choices = groups.flatMap((group) => group.choices);
    const selectedChoice = choices.find(({ plane }) => plane.name === value);

    const flagsLoading = !useFlagsPreloaded(
        choices.map(({ country }) => country)
    );

    return (
        <Select
            id={id}
            name={name}
            inputRef={inputRef}
            labelId={labelId}
            value={selectedChoice ? value : ''}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onBlur}
            // Size the menu to the space below the field; when it overflows,
            // MUI shifts it up to cover the field.
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
            disabled={disabled || flagsLoading}
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
                        <ChoiceDetail choice={selectedChoice} />
                    </Stack>
                ) : (
                    // Select has no placeholder; this matches InputBase's.
                    <Typography
                        component="span"
                        variant="inherit"
                        sx={{
                            opacity: (theme) =>
                                theme.palette.mode === 'light' ? 0.42 : 0.5,
                        }}
                    >
                        {loading || flagsLoading
                            ? 'Loading data planes…'
                            : 'Select a data plane'}
                    </Typography>
                )
            }
            MenuProps={{
                transitionDuration: 0,
                slotProps: {
                    paper: { sx: { maxHeight: menuMaxHeight } },
                    list: { sx: { py: 0 } },
                },
            }}
            sx={{
                'bgcolor': 'background.default',
                'borderRadius': 3,
                [`& .${outlinedInputClasses.input}`]: {
                    display: 'flex',
                    alignItems: 'center',
                },
                '& fieldset': { border: 'none' },
            }}
        >
            {groups.flatMap((group, index) => [
                <GroupHeader
                    key={`group-${group.provider}`}
                    divider={index > 0}
                    label={group.label}
                />,
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
                            <Typography
                                noWrap
                                sx={{ fontSize: 15, lineHeight: 1.35 }}
                            >
                                {choice.label}
                            </Typography>
                            <ChoiceDetail choice={choice} />
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
