import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Divider, Typography } from '@mui/material';
import ExternalLink from 'components/shared/ExternalLink';
import { EndpointConfigStoreNames, useZustandStore } from 'context/Zustand';
import { FormattedMessage } from 'react-intl';
import { EndpointConfigState } from 'stores/EndpointConfig';

interface Props {
    endpointConfigStoreName: EndpointConfigStoreNames;
    docsPath?: string;
}

function EndpointConfigHeader({ endpointConfigStoreName, docsPath }: Props) {
    const endpointConfigHasErrors = useZustandStore<
        EndpointConfigState,
        EndpointConfigState['endpointConfigErrorsExist']
    >(endpointConfigStoreName, (state) => state.endpointConfigErrorsExist);

    return (
        <>
            {endpointConfigHasErrors ? (
                <ErrorOutlineIcon color="error" sx={{ pr: 1 }} />
            ) : null}

            <Typography>
                <FormattedMessage id="entityCreate.endpointConfig.heading" />
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
                        <FormattedMessage id="entityCreate.ctas.docs" />
                    </ExternalLink>
                </>
            ) : null}
        </>
    );
}

export default EndpointConfigHeader;
