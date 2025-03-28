import { useMemo, useState } from 'react';

import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Typography,
    useTheme,
} from '@mui/material';

import CollectionList from './CollectionList';
import { NavArrowDown } from 'iconoir-react';
import { isEmpty } from 'lodash';
import { FormattedMessage } from 'react-intl';

import { useEditorStore_invalidEditors } from 'src/components/editor/Store/hooks';
import CatalogList, {
    CatalogListContent,
} from 'src/components/transformation/create/Config/catalog/CatalogList';
import { defaultOutline } from 'src/context/Theme';
import {
    useTransformationCreate_addMigrations,
    useTransformationCreate_migrations,
    useTransformationCreate_selectedAttribute,
} from 'src/stores/TransformationCreate/hooks';
import { hasLength } from 'src/utils/misc-utils';

function MigrationList() {
    const theme = useTheme();

    // Draft Editor Store
    const invalidEditors = useEditorStore_invalidEditors();

    // Transformation Create Store
    const selectedAttribute = useTransformationCreate_selectedAttribute();
    const migrations = useTransformationCreate_migrations();
    const addMigrations = useTransformationCreate_addMigrations();

    const [expanded, setExpanded] = useState(false);

    const content: CatalogListContent[] = useMemo(
        () =>
            Object.entries(migrations).map(([attributeId, migration]) => ({
                attributeId,
                value: attributeId,
                editorInvalid:
                    !hasLength(migration) ||
                    invalidEditors.includes(attributeId),
            })),
        [invalidEditors, migrations]
    );

    const migrationSelected = useMemo(
        () => selectedAttribute.includes('migration'),
        [selectedAttribute]
    );

    const handlers = {
        insertBlankMigration: () => {
            addMigrations(['']);
        },
        toggleAccordion: () => {
            setExpanded(!expanded);
        },
    };

    return (
        <Accordion
            expanded={expanded}
            onChange={handlers.toggleAccordion}
            sx={{
                'borderLeft': defaultOutline[theme.palette.mode],
                'borderRight': defaultOutline[theme.palette.mode],
                'borderBottom': defaultOutline[theme.palette.mode],
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
                            color:
                                migrationSelected && !expanded
                                    ? theme.palette.primary.main
                                    : theme.palette.text.primary,
                        }}
                    />
                }
                sx={{
                    'px': 1,
                    '& .MuiAccordionSummary-content': {
                        'my': 0,
                        'color': migrationSelected
                            ? theme.palette.primary.main
                            : theme.palette.text.primary,
                        '&.Mui-expanded': {
                            my: 0,
                            color: theme.palette.text.primary,
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
                    <FormattedMessage id="newTransform.config.advancedSettings.header" />
                </Typography>
            </AccordionSummary>

            <AccordionDetails sx={{ p: 0, borderBottomLeftRadius: 4 }}>
                <CatalogList
                    content={
                        <CollectionList
                            content={content}
                            fixedAttributeType="migration"
                        />
                    }
                    addButtonClickHandler={handlers.insertBlankMigration}
                    header={
                        <FormattedMessage id="newTransform.config.migration.header" />
                    }
                    height={200}
                    extendList={isEmpty(migrations)}
                />
            </AccordionDetails>
        </Accordion>
    );
}

export default MigrationList;
