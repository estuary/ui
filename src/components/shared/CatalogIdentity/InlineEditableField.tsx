import type { Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system/styleFunctionSx';
import type { KeyboardEvent, ReactNode, Ref } from 'react';

import { useState } from 'react';

import { Box, ButtonBase } from '@mui/material';

import { EditPencil } from 'iconoir-react';

import { hasLength } from 'src/utils/misc-utils';

const TRUNCATE_SX = {
    display: 'block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
} as const;

const EDIT_ICON_CLASS = 'catalog-identity-inline-edit';

const EDITABLE_TEXT_SX: SystemStyleObject<Theme> = {
    minWidth: 0,
    gap: 0.75,
    justifyContent: 'flex-start',
    [`& .${EDIT_ICON_CLASS}`]: {
        flex: 'none',
        color: 'text.secondary',
        opacity: 0,
        transition: 'opacity 150ms ease',
    },
    [`&:hover .${EDIT_ICON_CLASS}, &:focus-visible .${EDIT_ICON_CLASS}`]: {
        opacity: 0.7,
    },
};

interface InlineEditableFieldProps {
    buttonRef?: Ref<HTMLButtonElement>;
    onTab?: (event: KeyboardEvent<HTMLDivElement>) => void;
    value: string;
    placeholder: string;
    label: string;
    textSx: SystemStyleObject<Theme>;
    editable: boolean;
    onEditingChange?: (editing: boolean) => void;
    renderEditField: (finishEditing: () => void) => ReactNode;
}

export function InlineEditableField({
    buttonRef,
    onTab,
    value,
    placeholder,
    label,
    textSx,
    editable,
    onEditingChange,
    renderEditField,
}: InlineEditableFieldProps) {
    const [editing, setEditing] = useState(false);
    const changeEditing = (next: boolean) => {
        setEditing(next);
        onEditingChange?.(next);
    };
    const filled = hasLength(value);

    if (!editable) {
        return (
            <Box component="span" sx={{ ...textSx, ...TRUNCATE_SX }}>
                {value}
            </Box>
        );
    }

    if (editing) {
        return (
            <Box
                sx={{ display: 'flex', flex: 1, minWidth: 0 }}
                onKeyDown={(event) => {
                    if (event.key !== 'Tab' || event.defaultPrevented) return;

                    onTab?.(event);
                    if (event.defaultPrevented) {
                        changeEditing(false);
                    }
                }}
            >
                {renderEditField(() => changeEditing(false))}
            </Box>
        );
    }

    return (
        <ButtonBase
            ref={buttonRef}
            onFocus={() => changeEditing(true)}
            onClick={() => changeEditing(true)}
            disableRipple
            aria-label={`Edit ${label}, currently ${filled ? value : 'unset'}`}
            sx={[EDITABLE_TEXT_SX, textSx]}
        >
            <Box
                component="span"
                sx={{
                    ...TRUNCATE_SX,
                    color: filled ? 'inherit' : 'text.disabled',
                }}
            >
                {filled ? value : placeholder}
            </Box>

            <EditPencil width={14} height={14} className={EDIT_ICON_CLASS} />
        </ButtonBase>
    );
}
