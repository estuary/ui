import { Typography } from '@mui/material';

import { useMount } from 'react-use';

import usePageTitle from 'src/hooks/usePageTitle';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';

interface Props {
    catalogName?: string;
}

const EntityNotFound = ({ catalogName }: Props) => {
    usePageTitle({
        header: 'routeTitle.error.entityNotFound',
    });

    useMount(() => {
        logRocketEvent(CustomEvents.ENTITY_NOT_FOUND, {
            catalogName,
        });
    });

    return (
        <>
            <Typography variant="h5" align="center" sx={{ mb: 2 }}>
                Sorry, that entity cannot be found.
            </Typography>

            <Typography align="center" sx={{ wordBreak: 'break-all' }}>
                {catalogName ? (
                    <Typography sx={{ fontWeight: 'bold' }} component="span">
                        {catalogName}
                    </Typography>
                ) : (
                    <>The entity you are looking for</>
                )}{' '}
                was unable to be found.
            </Typography>

            <Typography align="center">
                This is likely because it has been deleted or you do not have
                access.
            </Typography>
        </>
    );
};

export default EntityNotFound;
