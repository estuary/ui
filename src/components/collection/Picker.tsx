import { Autocomplete, Box, TextField } from '@mui/material';
import useLiveSpecs from 'hooks/useLiveSpecs';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import {
    useResourceConfig_collections,
    useResourceConfig_setResourceConfig,
} from 'stores/ResourceConfig';
import useConstant from 'use-constant';

interface Props {
    readOnly?: boolean;
}

function CollectionPicker({ readOnly = false }: Props) {
    const intl = useIntl();
    const collectionsLabel = useConstant(() =>
        intl.formatMessage({
            id: 'entityCreate.bindingsConfig.collectionsLabel',
        })
    );
    const [missingInput, setMissingInput] = useState(false);

    const { liveSpecs: collectionData, error } = useLiveSpecs('collection');

    // Resource Config Store
    const collections = useResourceConfig_collections();

    const setResourceConfig = useResourceConfig_setResourceConfig();

    const handlers = {
        updateCollections: (event: React.SyntheticEvent, value: any) => {
            setResourceConfig(value);
        },
        validateSelection: () => {
            setMissingInput(!collections || collections.length === 0);
        },
    };

    // TODO (design): Determine whether the component should have a label or merely placeholder text.
    //   If a label is desired, the reflex container surrounding the collection selector instance
    //   requires padding to display the label when the field is active. If placeholder text will do,
    //   style overrides are necessary.
    return collections && collectionData.length > 0 && !error ? (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Autocomplete
                disabled={readOnly}
                multiple
                options={collectionData.map(({ catalog_name }) => catalog_name)}
                value={collections}
                size="small"
                filterSelectedOptions
                fullWidth
                onChange={handlers.updateCollections}
                blurOnSelect={false}
                disableCloseOnSelect
                limitTags={1}
                renderTags={() => {}}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder={collectionsLabel}
                        required
                        error={missingInput}
                        onBlur={handlers.validateSelection}
                    />
                )}
            />
        </Box>
    ) : null;
}

export default CollectionPicker;
