import { TextareaAutosize } from '@mui/material';

// TODO : This is not usable yet. Nothing is passed in so it does not even show the label/title.
export default function JSONBlobType() {
    return (
        <TextareaAutosize
            aria-label="TODO"
            placeholder="You can place whatever JSON you want here."
            style={{ width: 200 }}
        />
    );
}
