import { Box, Typography } from '@mui/material';
import {
    CaptureQueryWithSpec,
    MaterializationQueryWithSpec,
} from 'api/liveSpecsExt';
import ConnectorLogo from 'components/connectors/card/Logo';
import CustomWidthTooltip from 'components/shared/CustomWidthTooltip';
import EntityCardWrapper from 'components/shared/Entity/ExistingEntityCards/Cards/Wrapper';
import useEntityEditNavigate from 'components/shared/Entity/hooks/useEntityEditNavigate';
import { alternateConnectorImageBackgroundSx } from 'context/Theme';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { isEmpty } from 'lodash';
import LogRocket from 'logrocket';
import { useIntl } from 'react-intl';
import { CustomEvents } from 'services/logrocket';

interface Props {
    queryData: CaptureQueryWithSpec | MaterializationQueryWithSpec | null;
}

const trackEvent = (
    data: CaptureQueryWithSpec | MaterializationQueryWithSpec
) => {
    const logEvent: CustomEvents =
        data.spec_type === 'capture'
            ? CustomEvents.CAPTURE_CREATE_CONFIG_EDIT
            : CustomEvents.MATERIALIZATION_CREATE_CONFIG_EDIT;

    LogRocket.track(logEvent, {
        id: data.id,
        connector_id: data.connector_id,
    });
};

function ExistingEntityCard({ queryData }: Props) {
    const prefillPubIds = useGlobalSearchParams(
        GlobalSearchParams.PREFILL_PUB_ID,
        true
    );
    const navigateToEdit = useEntityEditNavigate();

    const intl = useIntl();

    const editTask = () => {
        if (!isEmpty(queryData)) {
            trackEvent(queryData);

            const baseParams = {
                [GlobalSearchParams.CONNECTOR_ID]: queryData.connector_id,
                [GlobalSearchParams.LIVE_SPEC_ID]: queryData.id,
                [GlobalSearchParams.LAST_PUB_ID]: queryData.last_pub_id,
            };

            const optionalParams =
                prefillPubIds.length > 0
                    ? { [GlobalSearchParams.PREFILL_PUB_ID]: prefillPubIds }
                    : null;

            // TODO (routes): Allow the user to return to the existing entity check page on browser back.
            navigateToEdit(queryData.spec_type, baseParams, optionalParams);
        }
    };

    if (!queryData) {
        return null;
    } else {
        return (
            <EntityCardWrapper clickHandler={editTask}>
                <Box sx={alternateConnectorImageBackgroundSx}>
                    <ConnectorLogo
                        imageSrc={queryData.image}
                        maxHeight={35}
                        padding="0 0.5rem"
                        unknownConnectorIconConfig={{ width: 51, fontSize: 24 }}
                    />
                </Box>

                <Box
                    sx={{
                        minWidth: 0,
                        ml: 2,
                        textAlign: 'left',
                    }}
                >
                    <CustomWidthTooltip
                        title={queryData.catalog_name}
                        placement="bottom-start"
                    >
                        <Typography noWrap sx={{ mb: 0.5 }}>
                            {queryData.catalog_name}
                        </Typography>
                    </CustomWidthTooltip>

                    <Typography variant="caption">
                        {intl.formatMessage(
                            {
                                id: 'existingEntityCheck.existingCard.label.lastPublished',
                            },
                            {
                                date: intl.formatDate(queryData.updated_at, {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                }),
                            }
                        )}
                    </Typography>
                </Box>
            </EntityCardWrapper>
        );
    }
}

export default ExistingEntityCard;
