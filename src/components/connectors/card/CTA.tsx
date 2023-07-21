import { EntityWithCreateWorkflow } from 'types';

import { FormattedMessage } from 'react-intl';

import { Button } from '@mui/material';

interface Props {
    ctaCallback: Function;
    entity: EntityWithCreateWorkflow;
}

function ConnectorCardCTA({ ctaCallback, entity }: Props) {
    return (
        <Button sx={{ justifySelf: 'flex-end' }} onClick={() => ctaCallback()}>
            {entity === 'capture' ? (
                <FormattedMessage id="connectorTable.actionsCta.capture" />
            ) : (
                <FormattedMessage id="connectorTable.actionsCta.materialization" />
            )}
        </Button>
    );
}

export default ConnectorCardCTA;
