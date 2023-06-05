import {
    InputAdornment,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
} from '@mui/material';
import { ChangeEventHandler } from 'react';

interface Props {
    label: string;
    defaultSelectValue: string;
    selectValues: string[];
    selectChangeHandler: (event: SelectChangeEvent<string>) => void;
    textChangeHandler: ChangeEventHandler<
        HTMLInputElement | HTMLTextAreaElement
    >;
    errorExists?: boolean;
}

function SelectTextField({
    label,
    defaultSelectValue,
    selectValues,
    selectChangeHandler,
    textChangeHandler,
    errorExists,
}: Props) {
    return (
        <TextField
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        {selectValues.length === 1 ? (
                            selectValues[0]
                        ) : (
                            <Select
                                size="small"
                                variant="standard"
                                value={defaultSelectValue}
                                disableUnderline
                                onChange={selectChangeHandler}
                                sx={{
                                    '& .MuiSelect-select': {
                                        paddingBottom: 0.2,
                                    },
                                }}
                            >
                                {selectValues.map((value) => (
                                    <MenuItem key={value} value={value}>
                                        {value}
                                    </MenuItem>
                                ))}
                            </Select>
                        )}
                    </InputAdornment>
                ),
                sx: { borderRadius: 3 },
            }}
            label={label}
            variant="outlined"
            size="small"
            error={errorExists}
            onChange={textChangeHandler}
            sx={{ flexGrow: 1 }}
        />
    );
}

export default SelectTextField;
