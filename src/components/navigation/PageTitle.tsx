import HelpIcon from '@mui/icons-material/Help';
import { IconButton, Link, Stack, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';

export interface PageTitleProps {
    header: string;
    headerLink?: string;
}

function PageTitle({ header, headerLink }: PageTitleProps) {
    return (
        <Stack direction="row" spacing={1}>
            <Typography
                variant="h6"
                sx={{
                    alignItems: 'center',
                }}
            >
                <FormattedMessage id={header} />
            </Typography>

            {headerLink ? (
                <Link target="_blank" rel="noopener" href={headerLink}>
                    <IconButton size="small">
                        <HelpIcon
                            sx={{
                                color: (theme) => theme.palette.text.primary,
                            }}
                        />
                    </IconButton>
                </Link>
            ) : null}
        </Stack>
    );
}

export default PageTitle;
