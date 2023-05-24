import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Typography,
    useTheme,
} from '@mui/material';
import CatalogList, {
    CatalogListContent,
} from 'components/transformation/create/DerivationEditor/Catalog/CatalogList';
import { defaultOutline, intensifiedOutline } from 'context/Theme';
import { NavArrowDown } from 'iconoir-react';
import { useMemo } from 'react';
import {
    useTransformationCreate_addMigrations,
    useTransformationCreate_migrations,
} from 'stores/TransformationCreate/hooks';

function MigrationList() {
    const theme = useTheme();

    const migrations = useTransformationCreate_migrations();
    const addMigrations = useTransformationCreate_addMigrations();

    const content: CatalogListContent[] = useMemo(
        () =>
            Object.keys(migrations).map((attributeId) => ({
                attributeId,
                value: attributeId,
            })),
        [migrations]
    );

    const handlers = {
        insertBlankMigration: () => {
            addMigrations(['']);
        },
    };

    return (
        <Accordion
            sx={{
                'borderLeft': intensifiedOutline[theme.palette.mode],
                'borderRight': intensifiedOutline[theme.palette.mode],
                'borderBottom': intensifiedOutline[theme.palette.mode],
                ':last-of-type': {
                    borderRadius: 0,
                },
                '&.Mui-expanded': {
                    mt: 0,
                    flexGrow: 1,
                },
            }}
        >
            <AccordionSummary
                expandIcon={
                    <NavArrowDown
                        style={{
                            color: theme.palette.text.primary,
                        }}
                    />
                }
                sx={{
                    'px': 1,
                    '& .MuiAccordionSummary-content': {
                        'my': 0,
                        '&.Mui-expanded': {
                            my: 0,
                        },
                    },
                    '&.Mui-expanded': {
                        minHeight: 48,
                        my: 0,
                        borderBottom: defaultOutline[theme.palette.mode],
                    },
                }}
            >
                <Typography sx={{ fontWeight: 500 }}>
                    Advanced Catalog Settings
                </Typography>
            </AccordionSummary>

            <AccordionDetails sx={{ pt: 0, px: 0, borderBottomLeftRadius: 4 }}>
                <CatalogList
                    fixedAttributeType="migration"
                    content={content}
                    addButtonClickHandler={handlers.insertBlankMigration}
                    minHeight={200}
                />
            </AccordionDetails>
        </Accordion>
    );
}

export default MigrationList;
