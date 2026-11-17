import type { Entity } from 'src/types';

import { Stack, Typography } from '@mui/material';

import AlertBox from 'src/components/shared/AlertBox';
import { useEntityType } from 'src/context/EntityContext';

type BindingSuffix = '' | '.allBindings';
type MessageKey = `${Entity}${BindingSuffix}`;

const MESSAGES: Partial<Record<MessageKey, string>> = {
    'capture': `Trigger a backfill of this collection from the source when published.`,
    'capture.allBindings': `Trigger a backfill of all enabled collections from the source when published. Disabled collections will not be backfilled.`,
    'materialization': `Trigger deletion of the destination dataset then replaying of the collection data into it when published.`,
    'materialization.allBindings': `Trigger deletion of entire destination data then replaying of the collection data into it when published.`,
};

interface Props {
    allBindings?: boolean;
}

export default function BackfillDescription({ allBindings }: Props) {
    const entityType = useEntityType();
    const bindingSuffix: BindingSuffix = allBindings ? '.allBindings' : '';
    const messageKey: MessageKey = `${entityType}${bindingSuffix}`;
    const message = MESSAGES[messageKey];

    return (
        <Stack spacing={2}>
            {message ? <Typography>{message}</Typography> : null}

            {allBindings && entityType === 'materialization' ? (
                <AlertBox severity="warning" short>
                    If you need to backfill, we recommend doing so from the
                    Sources tab and selecting &quot;Dataflow Reset&quot; since
                    it&apos;s often faster and uses less data.
                </AlertBox>
            ) : null}
        </Stack>
    );
}
