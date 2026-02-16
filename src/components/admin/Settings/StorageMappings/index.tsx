import { useCallback, useMemo } from 'react';

import { useSearchParams } from 'react-router-dom';

import {
    storageProviderToCloudProvider,
    useStorageMappings,
} from 'src/api/storageMappingsGql';
import { CreateMappingWizard } from 'src/components/admin/Settings/StorageMappings/Dialog/Create';
import { UpdateMappingDialog } from 'src/components/admin/Settings/StorageMappings/Dialog/Update';
import StandAloneTableTitle from 'src/components/tables/EntityTable/StandAloneTableTitle';
import StorageMappingsTable from 'src/components/tables/StorageMappings';
import { GlobalSearchParams } from 'src/hooks/searchParams/useGlobalSearchParams';

const docsUrl = 'https://docs.estuary.dev/concepts/storage-mappings/';

export function StorageMappings() {
    const [searchParams, setSearchParams] = useSearchParams();

    const smDialog = searchParams.get(GlobalSearchParams.SM_DIALOG);
    const smPrefix = searchParams.get(GlobalSearchParams.SM_PREFIX);

    const { storageMappings } = useStorageMappings();

    const closeDialog = useCallback(() => {
        setSearchParams((prev) => {
            prev.delete(GlobalSearchParams.SM_DIALOG);
            prev.delete(GlobalSearchParams.SM_PREFIX);
            return prev;
        });
    }, [setSearchParams]);

    // TODO: fix typing when storage mapping types are cleaned up
    const editMapping = useMemo(() => {
        if (smDialog !== 'edit' || !smPrefix) return null;

        const match = storageMappings.find(
            (sm) => sm.catalogPrefix === smPrefix
        );
        if (!match) return null;

        return {
            catalog_prefix: match.catalogPrefix,
            storage: {
                data_planes: match.storage.data_planes,
                stores: match.storage.stores.map((store) => ({
                    bucket: store.bucket,
                    provider: storageProviderToCloudProvider(store.provider),
                    storage_prefix: store.prefix,
                })),
            },
        };
    }, [smDialog, smPrefix, storageMappings]);

    return (
        <>
            <StandAloneTableTitle
                messageIntlKey="storageMappings.message"
                titleIntlKey="storageMappings.header"
                docsUrl={docsUrl}
            />
            <StorageMappingsTable />

            {smDialog === 'create' ? (
                <CreateMappingWizard open onClose={closeDialog} />
            ) : null}

            {editMapping ? (
                <UpdateMappingDialog
                    mapping={editMapping}
                    onClose={closeDialog}
                />
            ) : null}
        </>
    );
}
