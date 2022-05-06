import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Paper,
    Typography,
} from '@mui/material';
import ResourceConfig from 'components/materialization/ResourceConfig';

interface Props {
    collectionName: string;
    id: string;
}

function ExpandableResourceConfig({ collectionName, id }: Props) {
    return (
        <Paper>
            <Accordion defaultExpanded={true}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>{collectionName}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <ResourceConfig
                        connectorImage={id}
                        collectionName={collectionName}
                    />
                </AccordionDetails>
            </Accordion>
        </Paper>
    );
}

export default ExpandableResourceConfig;
