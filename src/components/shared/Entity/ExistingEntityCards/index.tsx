import { Grid } from '@mui/material';
import {
    CaptureQueryWithSpec,
    getLiveSpecsByConnectorId,
    MaterializationQueryWithSpec,
} from 'api/liveSpecsExt';
import ExistingEntityCard from 'components/shared/Entity/ExistingEntityCards/Card';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useEffect, useState } from 'react';
import { EntityWithCreateWorkflow } from 'types';

interface Props {
    entityType: EntityWithCreateWorkflow;
}

const getExistingEntites = async (
    entityType: EntityWithCreateWorkflow,
    connectorId: string
) => {
    const response = await getLiveSpecsByConnectorId(entityType, connectorId);

    return response;
};

function ExistingEntityCards({ entityType }: Props) {
    const connectorId = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);

    const [query, setQuery] = useState<
        CaptureQueryWithSpec[] | MaterializationQueryWithSpec[] | null
    >(null);

    useEffect(() => {
        getExistingEntites(entityType, connectorId).then(
            (response) => {
                setQuery(response.data);
            },
            () => {
                setQuery(null);
            }
        );
    }, [setQuery, connectorId, entityType]);

    return query && query.length > 0 ? (
        <Grid container spacing={{ xs: 2, md: 3 }}>
            {query.map((data, index) => (
                <Grid key={`existing-entity-card-${index}`} item xs={12}>
                    <ExistingEntityCard queryData={data} />
                </Grid>
            ))}
        </Grid>
    ) : null;
}

export default ExistingEntityCards;
