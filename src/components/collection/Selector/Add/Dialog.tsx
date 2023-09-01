import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Stack,
} from '@mui/material';
import BindingSelectorTable from 'components/collection/Selector/Table';
import StepWrapper from 'components/transformation/create/Wrapper';
import { ReactNode, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Entity } from 'types';
import { AddCollectionDialogCTAProps } from './types';

interface Props extends AddCollectionDialogCTAProps {
    id: string;
    open: boolean;
    primaryCTA: any;
    selectedCollections: string[];
    title: string | ReactNode;
}

function AddCollectionDialog({
    id,
    primaryCTA,
    open,
    selectedCollections,
    title,
    toggle,
}: Props) {
    const ContinueButton = primaryCTA;
    const [entityType, setEntityType] = useState<Entity>('collection');

    const handleChange = (event: SelectChangeEvent) => {
        setEntityType(event.target.value as Entity);
    };

    return (
        <Dialog id={id} open={open} fullWidth maxWidth="md">
            <DialogTitle>
                <FormControl variant="outlined">
                    <InputLabel>Type</InputLabel>
                    <Select
                        value={entityType}
                        label="Age"
                        onChange={handleChange}
                    >
                        <MenuItem value="collection">{title}</MenuItem>
                        <MenuItem value="capture">Captures</MenuItem>
                    </Select>
                </FormControl>
            </DialogTitle>

            <DialogContent>
                <Stack spacing={3} sx={{ pt: 2 }}>
                    <StepWrapper>
                        <Box>
                            <BindingSelectorTable
                                entityType={entityType}
                                selectedCollections={selectedCollections}
                            />
                        </Box>
                    </StepWrapper>
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button variant="outlined" onClick={() => toggle(false)}>
                    <FormattedMessage id="cta.cancel" />
                </Button>

                <ContinueButton toggle={toggle} />
            </DialogActions>
        </Dialog>
    );
}

export default AddCollectionDialog;
