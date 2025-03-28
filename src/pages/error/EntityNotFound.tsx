import { Typography } from '@mui/material';
import usePageTitle from 'src/hooks/usePageTitle';
import { FormattedMessage } from 'react-intl';
import { useMount } from 'react-use';
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
                <FormattedMessage id="entityNotFound.heading" />
            </Typography>

            <Typography align="center" sx={{ wordBreak: 'break-all' }}>
                {catalogName ? (
                    <Typography sx={{ fontWeight: 'bold' }} component="span">
                        {catalogName}
                    </Typography>
                ) : (
                    <FormattedMessage id="entityNotFound.message.default" />
                )}{' '}
                <FormattedMessage id="entityNotFound.detail" />
            </Typography>

            <Typography align="center">
                <FormattedMessage id="entityNotFound.explanation" />
            </Typography>
        </>
    );
};

export default EntityNotFound;
