import { useMemo } from 'react';

import { useUserInfoSummaryStore } from 'src/context/UserInfoSummary/useUserInfoSummaryStore';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { useEntitiesStore } from 'src/stores/Entities/Store';
import {
    generateDataPlaneOption,
    getDataPlaneInfo,
} from 'src/utils/dataPlane-utils';

export const useDataPlaneOptions = () => {
    const catalogName = useDetailsFormStore(
        (state) => state.details.data.entityName
    );
    const options = useDetailsFormStore((state) => state.dataPlaneOptions);
    const storageMappings = useEntitiesStore((state) => state.storageMappings);

    const hasSupportRole = useUserInfoSummaryStore(
        (state) => state.hasSupportAccess
    );

    return useMemo(() => {
        if (!hasSupportRole && catalogName) {
            const { dataPlaneNames } = getDataPlaneInfo(
                storageMappings,
                catalogName
            );

            return dataPlaneNames.map((dataPlaneName) => {
                const existingOption = options.find(
                    (option) => option.dataPlaneName.whole === dataPlaneName
                );

                return (
                    existingOption ??
                    generateDataPlaneOption(
                        {
                            data_plane_name: dataPlaneName,
                            id: dataPlaneName,
                            reactor_address: '',
                            cidr_blocks: null,
                            gcp_service_account_email: null,
                            aws_iam_user_arn: null,
                        },
                        dataPlaneNames.at(0)
                    )
                );
            });
        }

        return options;
    }, [catalogName, hasSupportRole, options, storageMappings]);
};
