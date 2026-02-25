import type {
    FieldPath,
    FieldValues,
    RegisterOptions,
    Validate,
} from 'react-hook-form';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ValidationRules } from './types';
import { useFormContext } from 'react-hook-form';

interface ProgressiveValidationReturn<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
> {
    rules: Omit<
        RegisterOptions<TFieldValues, TName>,
        'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
    >;
    /** Call on blur to enable final rules and trigger validation. */
    restoreFinal: () => void;
    /** Call on change to disable final rules and trigger validation. */
    suppressFinal: () => void;
}

export function useProgressiveValidation<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
    name: TName,
    {
        partialRules = {},
        finalRules = {},
    }: ValidationRules<TFieldValues, TName> = {}
): ProgressiveValidationReturn<TFieldValues, TName> {
    const { trigger } = useFormContext<TFieldValues>();
    const [hasBlurred, setHasBlurred] = useState(false);
    const shouldTriggerRef = useRef(false);

    const rules = useMemo(() => {
        const { validate: partialValidate, ...partialDeclarative } =
            partialRules;
        const { validate: finalValidate, ...finalDeclarative } = finalRules;

        // RHF validate can be a single fn or a record — normalize to record so we can merge.
        // Use distinct prefixes so a single-function partial and single-function final
        // don't collide on the same key.
        const normalizeValidate = (
            v: typeof partialValidate,
            prefix: string
        ): Record<string, Validate<any, TFieldValues>> => {
            if (!v) return {};
            if (typeof v === 'function') return { [prefix]: v };
            return v;
        };

        const partialValidators = normalizeValidate(
            partialValidate,
            '_partial'
        );
        const finalValidators = normalizeValidate(finalValidate, '_final');

        const gatedFinalValidators = Object.fromEntries(
            Object.entries(finalValidators).map(([key, fn]) => [
                key,
                (v: any, fv: TFieldValues) => (hasBlurred ? fn(v, fv) : true),
            ])
        );

        return {
            ...partialDeclarative,
            ...(hasBlurred ? finalDeclarative : {}),
            validate: {
                ...partialValidators,
                ...gatedFinalValidators,
            },
        };
    }, [partialRules, finalRules, hasBlurred]);

    // Trigger validation after the rules memo has recomputed following
    // a hasBlurred change. This ensures RHF sees the correct rule set.
    useEffect(() => {
        if (shouldTriggerRef.current) {
            shouldTriggerRef.current = false;
            void trigger(name);
        }
    }, [hasBlurred, trigger, name]);

    const restoreFinal = useCallback(() => {
        shouldTriggerRef.current = true;
        setHasBlurred(true);
    }, []);

    const suppressFinal = useCallback(() => {
        if (!hasBlurred) {
            // Already in partial-only mode — rules are correct, trigger immediately.
            void trigger(name);
            return;
        }
        shouldTriggerRef.current = true;
        setHasBlurred(false);
    }, [hasBlurred, trigger, name]);

    return {
        rules,
        restoreFinal,
        suppressFinal,
    };
}
