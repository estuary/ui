import { SvgIcon, SvgIconProps } from '@mui/material';

export function SparkleIcon(props: SvgIconProps) {
    return (
        <SvgIcon {...props} viewBox="0 0 24 24">
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
