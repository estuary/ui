import type { OutlinedTextFieldProps } from '@mui/material';

import {
    IconButton,
    InputAdornment,
    inputBaseClasses,
    outlinedInputClasses,
    TextField,
    useTheme,
} from '@mui/material';

import { Search, Xmark } from 'iconoir-react';

import { diminishedTextColor } from 'src/context/Theme';

// RGB translations of #0B131E and #F7F9FC. Quieter than the app-wide
// `defaultOutlineColor_hovered` (0.6), which flashes hard against this field's
// 0.23 resting border.
const searchOutlineColor_hovered = {
    light: `rgba(11, 19, 30, 0.35)`,
    dark: `rgba(247, 249, 252, 0.35)`,
};

interface Props
    extends Omit<
        OutlinedTextFieldProps,
        'size' | 'slotProps' | 'type' | 'variant'
    > {
    // Shows a button that clears the field, when given.
    onClear?: () => void;
}

export function SearchField({ onClear, sx, ...props }: Props) {
    const theme = useTheme();

    return (
        <TextField
            {...props}
            size="small"
            slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search
                                height={16}
                                width={16}
                                style={{
                                    color: diminishedTextColor[
                                        theme.palette.mode
                                    ],
                                }}
                            />
                        </InputAdornment>
                    ),
                    // Replaces the native clear button `type="search"` would
                    // draw in OS styling rather than this app's.
                    endAdornment: onClear ? (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="Clear search"
                                edge="end"
                                onClick={onClear}
                                size="small"
                            >
                                <Xmark height={14} width={14} />
                            </IconButton>
                        </InputAdornment>
                    ) : undefined,
                },
            }}
            sx={[
                {
                    [`& .${inputBaseClasses.root}`]: { borderRadius: 3 },
                    // Excluding the focused state leaves the primary focus
                    // ring to win once the field is actually active.
                    [`& .${outlinedInputClasses.root}:not(.${outlinedInputClasses.focused}):hover .${outlinedInputClasses.notchedOutline}`]:
                        {
                            borderColor:
                                searchOutlineColor_hovered[theme.palette.mode],
                        },
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
            type="text"
            variant="outlined"
        />
    );
}
