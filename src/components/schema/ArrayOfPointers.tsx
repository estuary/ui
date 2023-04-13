import { Autocomplete, Skeleton, TextField } from '@mui/material';
import { autoCompleteDefaults_Virtual_Multiple } from 'components/shared/AutoComplete/DefaultProps';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { isPlainObject } from 'lodash';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

type OnChange = typeof autoCompleteDefaults_Virtual_Multiple['onChange'];

interface Props {
    value: any;
    spec: DraftSpecQuery['spec'];
    onChange: OnChange;
}

function ArrayOfPointers({ spec, value, onChange }: Props) {
    const [keys, setKeys] = useState<string[]>([]);

    useEffect(() => {
        // TODO (schema editor) make this recursive and move to a standard location
        // We want to grab all the properties that are a type of string
        const nonObjectProperties = Object.entries(spec.schema.properties)
            .filter(
                ([_, propValue]: [any, any]) =>
                    isPlainObject(propValue) && propValue.type !== 'object'
            )
            .map((filteredList) => `/${filteredList[0]}`);

        setKeys(nonObjectProperties);
    }, [spec]);

    if (keys.length === 0) {
        return <Skeleton />;
    }

    return (
        <Autocomplete
            {...autoCompleteDefaults_Virtual_Multiple}
            onChange={onChange}
            defaultValue={value}
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
