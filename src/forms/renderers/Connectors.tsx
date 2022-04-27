import { RankedTester, rankWith, scopeEndsWith } from '@jsonforms/core';
import { withJsonFormsLayoutProps } from '@jsonforms/react';
import { Autocomplete, TextField } from '@mui/material';

const SCOPE = 'image';

export const connectorTypeTester: RankedTester = rankWith(
    999,
    scopeEndsWith(SCOPE)
);

// This is blank on purpose. For right now we can just show null settings are nothing
const ConnectorTypeRenderer = ({
    handleChange,
    id,
    data,
    path,
    schema,
    uischema,
}: any) => {
    return (
        <Autocomplete
            options={schema.properties.image.oneOf}
            renderInput={(params) => (
                <TextField
                    {...params}
                    id={id}
                    label={uischema.label}
                    required={schema.required.includes(SCOPE)}
                    inputProps={{
                        ...params.inputProps,
                        autoComplete: 'off',
                    }}
                />
            )}
            value={data}
            onChange={(e: any) => handleChange(path, e.target.value)}
            onSelect={(value) => handleChange(path, value)}

            // renderItem={(item: any, isHighlighted: any) => (
            //     <div
            //         key={item}
            //         style={{
            //             background: isHighlighted ? 'lightgray' : 'white',
            //         }}
            //     >
            //         {item}
            //     </div>
            // )}
        />
    );
};

export const ConnectorType = withJsonFormsLayoutProps(ConnectorTypeRenderer);
