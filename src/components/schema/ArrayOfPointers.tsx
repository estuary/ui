import { infer } from '@estuary/flow-web';
import { Autocomplete, Skeleton, TextField } from '@mui/material';
import { autoCompleteDefaults_Virtual_Multiple } from 'components/shared/AutoComplete/DefaultProps';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { hasLength } from 'utils/misc-utils';

type OnChange = typeof autoCompleteDefaults_Virtual_Multiple['onChange'];

interface Props {
    value: any;
    spec: DraftSpecQuery['spec'];
    onChange: OnChange;
}

const typesAllowedAsKeys = ['string', 'integer', 'boolean'];

function ArrayOfPointers({ spec, value, onChange }: Props) {
    const defaultValue = useRef(value);
    const [keys, setKeys] = useState<string[]>([]);

    useEffect(() => {
        // Infer the properties with WebFlow and then filter/map them for the dropdown
        const inferredProperties = infer(spec.schema)
            ?.properties?.filter((inferredProperty: any) => {
                const interrefPropertyTypes = inferredProperty.types;
                // If there is a blank pointer it cannot be used
                if (!hasLength(inferredProperty.pointer)) {
                    return false;
                }

                // Check if this field:
                //  must exist
                //  has a single known type
                //  has an allowed type
                return (
                    inferredProperty.exists === 'must' &&
                    interrefPropertyTypes.length === 1 &&
                    typesAllowedAsKeys.some((key) =>
                        interrefPropertyTypes.includes(key)
                    )
                );
            })
            .map(
                // We only care about the pointer
                (filteredInferredProperty: any) =>
                    filteredInferredProperty.pointer
            );
        setKeys(inferredProperties);
    }, [spec]);

    if (keys.length === 0) {
        return <Skeleton />;
    }

    return (
        <Autocomplete
            {...autoCompleteDefaults_Virtual_Multiple}
            onChange={onChange}
            defaultValue={defaultValue.current}
            options={keys}
            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="standard"
                    label={<FormattedMessage id="data.key.label" />}
                    helperText={<FormattedMessage id="data.key.helper" />}
                />
            )}
        />
    );
}

export default ArrayOfPointers;
