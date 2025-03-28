import { materialCells } from '@jsonforms/material-renderers';

import { customAjv } from 'src/services/ajv';
import defaultRenderers from 'src/services/jsonforms/defaultRenderers';
import { defaultOptions } from 'src/services/jsonforms/shared';

export const jsonFormsDefaults = {
    renderers: defaultRenderers,
    cells: materialCells,
    config: defaultOptions,
    ajv: customAjv,
};
