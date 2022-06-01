import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Divider, Typography } from '@mui/material';
import ExternalLink from 'components/shared/ExternalLink';
import { useRouteStore } from 'hooks/useRouteStore';
import { FormattedMessage } from 'react-intl';
import { entityCreateStoreSelectors } from 'stores/Create';

interface Props {
    docsPath?: string;
}

function EndpointConfigHeader({ docsPath }: Props) {
    const entityCreateStore = useRouteStore();
    const endpointConfigHasErrors = entityCreateStore(
        entityCreateStoreSelectors.endpointConfig.hasErrors
    );

    return (
        <>
            {endpointConfigHasErrors ? (
                <ErrorOutlineIcon color="error" sx={{ pr: 1 }} />
            ) : null}

            <Typography>
                <FormattedMessage id="foo.endpointConfig.heading" />
            </Typography>

            {docsPath && docsPath.length > 0 ? (
                <>
                    <Divider
                        orientation="vertical"
                        flexItem
                        sx={{
                            mx: 1,
                        }}
                    />
                    <ExternalLink link={docsPath}>
                        <FormattedMessage id="foo.ctas.docs" />
                    </ExternalLink>
                </>
            ) : null}
        </>
    );
}

export default EndpointConfigHeader;
