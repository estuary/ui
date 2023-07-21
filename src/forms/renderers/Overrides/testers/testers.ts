import { has, isEmpty } from 'lodash';

import { Tester, UISchemaElement } from '@jsonforms/core';

// The normal option tester 'optionIs' needs to test for a specific value
//  and not just if it exists. This is tweaking that tester
export const optionExists =
    (optionName: string): Tester =>
    (uischema: UISchemaElement): boolean => {
        if (isEmpty(uischema)) {
            return false;
        }

        const options = uischema.options;
        return !isEmpty(options) && has(options, optionName);
    };
