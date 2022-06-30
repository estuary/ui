import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Typography,
} from '@mui/material';
import ResourceConfig from 'components/collection/ResourceConfig';
import { slate } from 'context/Theme';

interface Props {
    collectionName: string;
    id: string;
}

function ExpandableResourceConfig({ collectionName, id }: Props) {
    return (
        <Accordion defaultExpanded={true}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                    backgroundColor: (theme) =>
                        theme.palette.mode === 'dark'
                            ? 'transparent'
                            : slate[50],
                }}
            >
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
