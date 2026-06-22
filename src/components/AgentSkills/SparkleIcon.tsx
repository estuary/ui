import type { SvgIconProps } from '@mui/material';

import { SvgIcon } from '@mui/material';

export function SparkleIcon(props: SvgIconProps) {
    return (
        // The two sparkles span x≈3.3–22.7, so their content center sits ~1 unit
        // right of a 0 0 24 24 box — which reads as extra padding on the left in
        // the nav rail. Shift the viewBox right by 1 to center the content.
        <SvgIcon {...props} viewBox="1 0 24 24">
            <path
                d="M12 2.5l1.7 4.6a4 4 0 0 0 2.4 2.4l4.6 1.7-4.6 1.7a4 4 0 0 0-2.4 2.4L12 19.9l-1.7-4.6a4 4 0 0 0-2.4-2.4L3.3 11.2l4.6-1.7a4 4 0 0 0 2.4-2.4L12 2.5z"
                fill="currentColor"
            />
            <path
                d="M19 14.5l.7 1.9a1.8 1.8 0 0 0 1.1 1.1l1.9.7-1.9.7a1.8 1.8 0 0 0-1.1 1.1L19 22l-.7-1.9a1.8 1.8 0 0 0-1.1-1.1L15.3 18l1.9-.7a1.8 1.8 0 0 0 1.1-1.1l.7-1.9z"
                fill="currentColor"
                fillOpacity={0.92}
            />
        </SvgIcon>
    );
}
