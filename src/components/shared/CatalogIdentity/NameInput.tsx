import type { Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system/styleFunctionSx';

import {
    IconButton,
    InputBase,
    inputBaseClasses,
    Stack,
    Tooltip,
} from '@mui/material';

import { Refresh } from 'iconoir-react';

import {
    getAutofillIgnoreProps,
    normalizeCatalogName,
} from 'src/utils/misc-utils';

interface NameInputProps {
    value: string;
    onChange: (value: string) => void;
    onRegenerate?: () => void;
    onFinishEditing: () => void;
    placeholder: string;
    inputSx: SystemStyleObject<Theme>;
    buttonSize: number;
}

export function NameInput({
    value,
    onChange,
    onRegenerate,
    onFinishEditing,
    placeholder,
    inputSx,
    buttonSize,
}: NameInputProps) {
    return (
        <Stack
            direction="row"
            spacing={1}
            sx={{
                flex: 1,
                minWidth: 0,
                alignItems: 'center',
            }}
        >
            <InputBase
                value={value}
                onChange={(event) =>
                    onChange(normalizeCatalogName(event.target.value))
                }
                onBlur={onFinishEditing}
                onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                        onFinishEditing();
                    }
                }}
                placeholder={placeholder}
                autoFocus
                onFocus={(event) => {
                    const input = event.target;
                    input.setSelectionRange(
                        input.value.length,
                        input.value.length
                    );
                }}
                inputProps={{
                    'aria-label': 'Name',
                    ...getAutofillIgnoreProps(),
                }}
                sx={{
                    ...inputSx,
                    minWidth: 0,
                    [`& .${inputBaseClasses.input}`]: {
                        p: 0,
                        height: 'auto',
                    },
                }}
            />
            <Tooltip title="Generate name">
                <IconButton
                    size="small"
                    onClick={onRegenerate}
                    // Keep focus on the input
                    onMouseDown={(event) => event.preventDefault()}
                    aria-label="Generate name"
                    sx={{
                        flex: 'none',
                        p: 0,
                        width: buttonSize,
                        height: buttonSize,
                    }}
                >
                    <Refresh width={14} height={14} strokeWidth={2} />
                </IconButton>
            </Tooltip>
        </Stack>
    );
}
