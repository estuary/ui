import { IconButton, Stack } from '@mui/material';

import { NavArrowLeft, NavArrowRight } from 'iconoir-react';

import {
    captionSx,
    numericSx,
} from 'src/components/admin/Billing/shared/CardHeader';

interface PageButton {
    label: string;
    disabled: boolean;
    onClick: () => void;
}

interface Props {
    // The rows shown, as "1–5" or "11–20 of 25 tasks".
    range: string | null;
    // Names the page buttons, which are left out when there's one page.
    label: string;
    pages?: { previous: PageButton; next: PageButton };
}

export function PagerFooter({ range, label, pages }: Props) {
    return (
        <Stack
            direction="row"
            sx={{
                ...captionSx,
                ...numericSx,
                justifyContent: 'space-between',
                alignItems: 'center',
                columnGap: 1.5,
                minHeight: 48,
                pl: 3,
                pr: 2,
            }}
        >
            <span>{range}</span>

            {pages ? (
                <Stack
                    component="nav"
                    aria-label={label}
                    direction="row"
                    spacing={0.5}
                >
                    <IconButton
                        size="small"
                        aria-label={pages.previous.label}
                        disabled={pages.previous.disabled}
                        onClick={pages.previous.onClick}
                    >
                        <NavArrowLeft height={16} width={16} />
                    </IconButton>
                    <IconButton
                        size="small"
                        aria-label={pages.next.label}
                        disabled={pages.next.disabled}
                        onClick={pages.next.onClick}
                    >
                        <NavArrowRight height={16} width={16} />
                    </IconButton>
                </Stack>
            ) : null}
        </Stack>
    );
}
