import { Button } from '@mui/material';
import { createDraftSpec, modifyDraftSpec } from 'api/draftSpecs';
import { getLiveSpecsByCatalogName } from 'api/liveSpecsExt';
import { CollectionData } from 'components/editor/Bindings/types';
import { useEditorStore_persistedDraftId } from 'components/editor/Store/hooks';
import { isEqual } from 'lodash';
import { Dispatch, SetStateAction } from 'react';
import { FormattedMessage } from 'react-intl';
import { CallSupabaseResponse } from 'services/supabase';
import { Schema } from 'types';

interface Props {
    catalogName: string;
    collectionData: CollectionData;
    inferredSchema: Schema | null | undefined;
    schemaUpdateErrored: boolean;
    loading: boolean;
    setCollectionData: Dispatch<
        SetStateAction<CollectionData | null | undefined>
    >;
    setSchemaUpdateErrored: Dispatch<SetStateAction<boolean>>;
    setLoading: Dispatch<SetStateAction<boolean>>;
}

const processDraftSpecResponse = (
    draftSpecResponse: CallSupabaseResponse<any>,
    schemaUpdateErrored: boolean,
    setSchemaUpdateErrored: Dispatch<SetStateAction<boolean>>,
    setLoading: Dispatch<SetStateAction<boolean>>,
    setCollectionData: Dispatch<
        SetStateAction<CollectionData | null | undefined>
    >
) => {
    if (draftSpecResponse.error) {
        setSchemaUpdateErrored(true);
        setLoading(false);
    } else if (draftSpecResponse.data && draftSpecResponse.data.length > 0) {
        if (schemaUpdateErrored) {
            setSchemaUpdateErrored(false);
        }

        setCollectionData({
            spec: draftSpecResponse.data[0].spec,
            belongsToDraft: true,
        });

        setLoading(false);
    } else {
        setSchemaUpdateErrored(true);
        setLoading(false);
    }
};

function ApplySchemaButton({
    catalogName,
    collectionData,
    inferredSchema,
    schemaUpdateErrored,
    loading,
    setCollectionData,
    setSchemaUpdateErrored,
    setLoading,
}: Props) {
    // Draft Editor Store
    const persistedDraftId = useEditorStore_persistedDraftId();

    const handlers = {
        updateServer: async (event: React.MouseEvent<HTMLElement>) => {
            event.preventDefault();

            if (persistedDraftId && inferredSchema) {
                setSchemaUpdateErrored(false);
                setLoading(true);

                if (collectionData.belongsToDraft) {
                    const draftSpecResponse = await modifyDraftSpec(
                        inferredSchema,
                        {
                            draft_id: persistedDraftId,
                            catalog_name: catalogName,
                        }
                    );

                    processDraftSpecResponse(
                        draftSpecResponse,
                        schemaUpdateErrored,
                        setSchemaUpdateErrored,
                        setLoading,
                        setCollectionData
                    );
                } else {
                    const liveSpecsResponse = await getLiveSpecsByCatalogName(
                        catalogName,
                        'collection'
                    );

                    if (liveSpecsResponse.error) {
                        setSchemaUpdateErrored(true);
                        setLoading(false);
                    } else if (liveSpecsResponse.data) {
                        const { last_pub_id } = liveSpecsResponse.data[0];

                        const draftSpecResponse = await createDraftSpec(
                            persistedDraftId,
                            catalogName,
                            inferredSchema,
                            'collection',
                            last_pub_id
                        );

                        processDraftSpecResponse(
                            draftSpecResponse,
                            schemaUpdateErrored,
                            setSchemaUpdateErrored,
                            setLoading,
                            setCollectionData
                        );
                    }
                }
            } else {
                setSchemaUpdateErrored(true);
            }
        },
    };

    return (
        <Button
            disabled={
                !inferredSchema ||
                isEqual(collectionData.spec, inferredSchema) ||
                loading
            }
            onClick={handlers.updateServer}
        >
            <FormattedMessage id="workflows.collectionSelector.schemaInference.cta.continue" />
        </Button>
    );
}

export default ApplySchemaButton;
