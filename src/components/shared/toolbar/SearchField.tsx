import { TextField } from '@mui/material';

interface Props {
    changeHandler: React.ChangeEventHandler<
        HTMLTextAreaElement | HTMLInputElement
    >;
    label: string;
    autoFocus?: boolean;
    id?: string;
}

function SearchField({ label, changeHandler, id, autoFocus }: Props) {
    return (
        <TextField
            id={id}
            autoFocus={autoFocus}
            label={label}
            variant="outlined"
            size="small"
            onChange={changeHandler}
            sx={{
                'width': '100%',
                '& .MuiInputBase-root': { borderRadius: 3 },
            }}
        />
    );
}

export default SearchField;
