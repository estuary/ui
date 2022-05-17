import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Typography,
} from '@mui/material';
import ResourceConfig from 'components/materialization/ResourceConfig';

interface Props {
    collectionName: string;
    id: string;
}

function ExpandableResourceConfig({ collectionName, id }: Props) {
    return (
        <Accordion defaultExpanded={true}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography
                    sx={{
                        wordBreak: 'break-all',
                    }}
                >
                    {collectionName}
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <ResourceConfig
                    connectorImage={id}
                    collectionName={collectionName}
                />
            </AccordionDetails>
        </Accordion>
    );
}

export default ExpandableResourceConfig;
