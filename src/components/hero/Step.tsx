import { BaseComponentProps } from 'types';

import { FormattedMessage } from 'react-intl';

import { Avatar, Stack, Typography } from '@mui/material';

interface Props extends BaseComponentProps {
    stepNumber: number;
    title: string;
}

function HeroStep({ children, stepNumber, title }: Props) {
    return (
        <>
            <Stack
                direction="row"
                spacing={1}
                sx={{
                    mb: 1.5,
                    alignItems: 'center',
                    justifyContent: 'center',
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

export default HeroStep;
