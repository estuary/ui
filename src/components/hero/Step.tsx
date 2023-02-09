import { Avatar, Stack, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { EntityWithCreateWorkflow } from 'types';

interface Props {
    stepNumber: 1 | 2;
    entityType: EntityWithCreateWorkflow;
}

function Step({ stepNumber, entityType }: Props) {
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
                    <FormattedMessage id={`terms.${entityType}`} />
                </Typography>
            </Stack>

            <Typography variant="subtitle1">
                <FormattedMessage
                    id={`home.hero.companyDetails.step${stepNumber}`}
                />
            </Typography>
        </>
    );
}

export default Step;
