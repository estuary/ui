import { DialogTitle, Typography } from '@mui/material';

interface BillingDialogTitleProps {
    title: string;
    // e.g. "Step 1 of 2" while adding a payment method.
    step?: string;
    subtitle?: string;
}

export function BillingDialogTitle({
    title,
    step,
    subtitle,
}: BillingDialogTitleProps) {
    return (
        <DialogTitle component="div">
            {step ? (
                <Typography
                    variant="caption"
                    component="div"
                    sx={{ color: 'text.secondary' }}
                >
                    {step}
                </Typography>
            ) : null}
            <Typography variant="h6" component="h2">
                {title}
            </Typography>
            {subtitle ? (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {subtitle}
                </Typography>
            ) : null}
        </DialogTitle>
    );
}
