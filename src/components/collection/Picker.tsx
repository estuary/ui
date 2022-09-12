import { Autocomplete, Box, TextField, Typography } from '@mui/material';
import { ResourceConfigStoreNames, useZustandStore } from 'context/Zustand';
import useLiveSpecs from 'hooks/useLiveSpecs';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useFormStateStore_messagePrefix } from 'stores/FormState';
import {
    ResourceConfigState,
    useResourceConfig_collections,
} from 'stores/ResourceConfig';
import useConstant from 'use-constant';

interface Props {
    resourceConfigStoreName: ResourceConfigStoreNames;
    readOnly?: boolean;
}

function CollectionPicker({
    resourceConfigStoreName,
    readOnly = false,
}: Props) {
    const intl = useIntl();
    const collectionsLabel = useConstant(() =>
        intl.formatMessage({
            id: 'entityCreate.bindingsConfig.collectionsLabel',
        })
    );
    const [missingInput, setMissingInput] = useState(false);

    const { liveSpecs: collectionData, error } = useLiveSpecs('collection');

    // Form State Store
    const messagePrefix = useFormStateStore_messagePrefix();

    // Resource Config Store
    const collections = useResourceConfig_collections();

    const setResourceConfig = useZustandStore<
        ResourceConfigState,
        ResourceConfigState['setResourceConfig']
    >(resourceConfigStoreName, (state) => state.setResourceConfig);

    const handlers = {
        updateCollections: (event: React.SyntheticEvent, value: any) => {
            setResourceConfig(value);
        },
        validateSelection: () => {
            setMissingInput(!collections || collections.length === 0);
        },
    };

    return collections && collectionData.length > 0 && !error ? (
        <Box>
            <Typography variant="h5" sx={{ mb: 1 }}>
                <FormattedMessage
                    id={`${messagePrefix}.collectionSelector.heading`}
                />
            </Typography>

            <Typography sx={{ mb: 2 }}>
                <FormattedMessage
                    id={`${messagePrefix}.collectionSelector.instructions`}
                />
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Autocomplete
                    disabled={readOnly}
                    multiple
                    options={collectionData.map(
                        ({ catalog_name }) => catalog_name
                    )}
                    value={collections}
                    size="small"
                    filterSelectedOptions
                    fullWidth
                    onChange={handlers.updateCollections}
                    blurOnSelect={false}
                    disableCloseOnSelect
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={collectionsLabel}
                            required
                            error={missingInput}
                            onBlur={handlers.validateSelection}
                        />
                    )}
                />
            </Box>
        </Box>
    ) : null;
}

export default CollectionPicker;
