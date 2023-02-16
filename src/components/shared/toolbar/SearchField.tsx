import { TextField } from '@mui/material';

interface Props {
    label: string;
    changeHandler: React.ChangeEventHandler<
        HTMLTextAreaElement | HTMLInputElement
    >;
    id?: string;
    autoFocus?: boolean;
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
