import { Avatar, Stack, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { BaseComponentProps } from 'types';

interface Props extends BaseComponentProps {
    stepNumber: number;
    title: string;
}

function HeroBaseStep({ children, stepNumber, title }: Props) {
    return (
        <>
            <Stack
                direction="row"
                spacing={1}
                sx={{
                    mb: 1.5,
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 'max-content',
                }}
            >
                <Avatar
                    sx={{
                        width: 30,
                        height: 30,
                        backgroundColor: (theme) =>
                            theme.palette.secondary.main,
                        fontSize: 16,
                    }}
                >
                    {stepNumber}
                </Avatar>

                <Typography variant="h6">
                    <FormattedMessage id={title} />
                </Typography>
            </Stack>

            <Typography variant="subtitle1">{children}</Typography>
        </>
    );
}

export default HeroBaseStep;
