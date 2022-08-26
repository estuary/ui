import { Stack, Typography } from '@mui/material';
import ExternalLink from 'components/shared/ExternalLink';
import { FormattedMessage } from 'react-intl';

export interface PageTitleProps {
    header: string;
    headerLink?: string;
}

function PageTitle({ header, headerLink }: PageTitleProps) {
    return (
        <Stack
            direction="row"
            spacing={1}
            sx={{
                alignItems: 'baseline',
            }}
        >
            <Typography variant="h6">
                <FormattedMessage id={header} />
            </Typography>

            {headerLink ? (
                <ExternalLink link={headerLink}>
                    <FormattedMessage id="terms.documentation" />
                </ExternalLink>
            ) : null}
        </Stack>
    );
}

export default PageTitle;
