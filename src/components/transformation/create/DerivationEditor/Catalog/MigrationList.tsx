import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Typography,
    useTheme,
} from '@mui/material';
import CatalogList from 'components/transformation/create/DerivationEditor/Catalog/CatalogList';
import { defaultOutline } from 'context/Theme';
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

    const content: [string, null][] = useMemo(
        () => Object.keys(migrations).map((id) => [id, null]),
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
                ':last-of-type': {
                    borderBottomLeftRadius: 4,
                    borderBottomRightRadius: 0,
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
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
                        backgroundColor:
                            theme.palette.mode === 'dark'
                                ? 'transparent'
                                : 'white',
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
