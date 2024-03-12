import { FormControl, Select, SelectChangeEvent, Stack } from '@mui/material';
import Box from '@mui/material/Box';
import Input from '@mui/material/Input';
import MenuItem from '@mui/material/MenuItem';
import ConnectorIcon from 'components/connectors/ConnectorIcon';
import { generateImagePath } from 'components/shared/Entity/DetailsForm/Form';
import { useState } from 'react';

interface Props {
    inputProps: any;
    InputProps: any;
    currentOption: any | null;
    currentOptionsTags: any[] | null;
    appliedUiSchemaOptions: any;
    enabled: any;
    updateTag: (val: any) => void;
}

function ConnectorInput({
    inputProps,
    InputProps,
    currentOption,
    currentOptionsTags,
    appliedUiSchemaOptions,
    enabled,
    updateTag,
}: Props) {
    const [connectorTag, setConnectorTag] = useState(currentOption.value.id);

    const handleChange = (event: SelectChangeEvent) => {
        setConnectorTag(event.target.value);

        const selectedTag = currentOptionsTags?.find((currentOptionsTag) => {
            return currentOptionsTag.id === event.target.value;
        });

        const newValue = {
            ...currentOption.value,
            id: event.target.value,
            imagePath: generateImagePath(
                currentOption.value.imageName,
                selectedTag.image_tag
            ),
        };

        updateTag(newValue);
    };

    return (
        <Stack direction="row" sx={{ width: '100%' }}>
            <Box
                sx={{
                    'width': '100%',
                    '.MuiBox-root + .MuiInput-root > input': {
                        textIndent: '25px',
                    },
                }}
            >
                {currentOption ? (
                    <Box
                        sx={{
                            position: 'absolute',
                            left: 0,
                            top: 22,
                        }}
                    >
                        <ConnectorIcon
                            iconPath={currentOption.value.iconPath}
                        />
                    </Box>
                ) : null}

                <Input
                    style={{ width: '100%' }}
                    type="text"
                    inputProps={inputProps}
                    inputRef={InputProps.ref}
                    autoFocus={appliedUiSchemaOptions.focus}
                    disabled={!enabled}
                />
            </Box>
            {currentOptionsTags && currentOptionsTags.length > 1 ? (
                <Box>
                    <FormControl>
                        <Select
                            id="connector-tag-select"
                            value={connectorTag}
                            onChange={handleChange}
                        >
                            {currentOptionsTags.map(
                                (currentOptionsTag: any) => {
                                    return (
                                        <MenuItem
                                            key={`connector-tag-option__${currentOptionsTag.id}`}
                                            value={currentOptionsTag.id}
                                        >
                                            {currentOptionsTag.imageTag}
                                        </MenuItem>
                                    );
                                }
                            )}
                        </Select>
                    </FormControl>
                </Box>
            ) : null}
        </Stack>
    );
}

export default ConnectorInput;
