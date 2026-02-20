import { useShallow } from 'zustand/react/shallow';

import { Stack, Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import ExternalLink from 'src/components/shared/ExternalLink';
import { useTopBarStore } from 'src/stores/TopBar/Store';

function PageTitle() {
    const [header, headerLink] = useTopBarStore(
        useShallow((state) => [state.header, state.headerLink])
    );

    // If there isn't a header don't show anything. You cannot display JUST the doc links
    if (!header) {
        return null;
    }

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
