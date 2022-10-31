import { Autocomplete, Box, TextField } from '@mui/material';
import { useEditorStore_persistedDraftId } from 'components/editor/Store';
import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow } from 'context/Workflow';
import useDraftSpecs from 'hooks/useDraftSpecs';
import useLiveSpecs from 'hooks/useLiveSpecs';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useFormStateStore_isActive } from 'stores/FormState';
import {
    useResourceConfig_collections,
    useResourceConfig_setResourceConfig,
} from 'stores/ResourceConfig';
import { ENTITY } from 'types';
import useConstant from 'use-constant';

interface Props {
    readOnly?: boolean;
}

interface CollectionData {
    name: string;
    classification: string;
}

function CollectionPicker({ readOnly = false }: Props) {
    const entityType = useEntityType();
    const workflow = useEntityWorkflow();

    const intl = useIntl();
    const collectionsLabel = useConstant(() =>
        intl.formatMessage({
            id: 'entityCreate.bindingsConfig.collectionsLabel',
        })
    );

    const [collectionData, setCollectionData] = useState<CollectionData[]>([]);
    const [missingInput, setMissingInput] = useState(false);

    const {
        liveSpecs,
        error: liveSpecsError,
        isValidating: isValidatingLiveSpecs,
    } = useLiveSpecs('collection');

    // Draft Editor Store
    const persistedDraftId = useEditorStore_persistedDraftId();

    // Form State Store
    const formActive = useFormStateStore_isActive();

    // Resource Config Store
    const collections = useResourceConfig_collections();

    const setResourceConfig = useResourceConfig_setResourceConfig();

    const {
        draftSpecs,
        error: draftSpecsError,
        isValidating: isValidatingDraftSpecs,
    } = useDraftSpecs(persistedDraftId);

    useEffect(() => {
        const populateCollectionData =
            entityType === ENTITY.MATERIALIZATION
                ? liveSpecs.length > 0
                : !isValidatingLiveSpecs && !isValidatingDraftSpecs;

        if (populateCollectionData) {
            let collectionsOnServer: CollectionData[] = liveSpecs.map(
                ({ catalog_name }) => ({
                    name: catalog_name,
                    classification: 'Existing Collections',
                })
            );

            if (entityType === ENTITY.CAPTURE) {
                collectionsOnServer = [
                    ...draftSpecs
                        .filter(
                            ({ spec_type }) => spec_type === ENTITY.COLLECTION
                        )
                        .map(({ catalog_name }) => ({
                            name: catalog_name,
                            classification: 'Discovered Collections',
                        })),
                    ...collectionsOnServer,
                ];
            }

            setCollectionData(collectionsOnServer);
        }
    }, [
        setCollectionData,
        collections,
        draftSpecs,
        entityType,
        isValidatingDraftSpecs,
        isValidatingLiveSpecs,
        liveSpecs,
        workflow,
    ]);

    const handlers = {
        updateCollections: (
            _event: React.SyntheticEvent,
            value: CollectionData[]
        ) => {
            setResourceConfig(value.map(({ name }) => name));
        },
        validateSelection: () => {
            setMissingInput(!collections || collections.length === 0);
        },
    };

    const specError =
        entityType === ENTITY.MATERIALIZATION
            ? liveSpecsError
            : liveSpecsError ?? draftSpecsError;

    return collections && collectionData.length > 0 && !specError ? (
        <Box
            sx={{
                p: '0.5rem 0.5rem 1rem',
                display: 'flex',
                alignItems: 'center',
            }}
        >
            <Autocomplete
                disabled={readOnly || formActive}
                multiple
                options={collectionData}
                groupBy={(option) => option.classification}
                getOptionLabel={(option) => option.name}
                value={collections.map(
                    (collectionName) =>
                        collectionData.find(
                            ({ name }) => name === collectionName
                        ) ?? {
                            name: collectionName,
                            classification: 'Existing Collections',
                        }
                )}
                size="small"
                filterSelectedOptions
                fullWidth
                onChange={handlers.updateCollections}
                blurOnSelect={false}
                disableCloseOnSelect
                disableClearable
                renderTags={() => {}}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label={collectionsLabel}
                        required
                        error={missingInput}
                        variant="standard"
                        onBlur={handlers.validateSelection}
                    />
                )}
            />
        </Box>
    ) : null;
}

export default CollectionPicker;
