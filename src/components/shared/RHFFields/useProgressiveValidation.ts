import type {
    FieldPath,
    FieldValues,
    RegisterOptions,
    Validate,
} from 'react-hook-form';
import type {
    FinalRules,
    PartialRules,
} from 'src/components/shared/RHFFields/types';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface ProgressiveValidationReturn<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
> {
    rules: Omit<
        RegisterOptions<TFieldValues, TName>,
        'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
    >;
    /**
     * Marks the field as blurred, enabling final declarative rules.
     *
     * @param onRulesResolved Called after the re-render that includes
     * final declarative rules in the rules object. Pass `() => trigger(name)`
     * so RHF validates against the complete rule set, not the stale one.
     */
    blurValidation: (onRulesResolved?: () => void) => void;
    focusValidation: () => void;
}
/**
 * Splits validation into change-time and blur-time phases.
 * Blur validators are gated so they only run after the field
 * has been blurred, then suppressed again on field change.
 */
export function useProgressiveValidation<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    partialRules = {},
    finalRules = {},
}: {
    /** Must be a stable/memoized reference — inline objects will break memoization. */
    partialRules?: PartialRules<TFieldValues, TName>;
    /** Must be a stable/memoized reference — inline objects will break memoization. */
    finalRules?: FinalRules<TFieldValues, TName>;
}): ProgressiveValidationReturn<TFieldValues, TName> {
    const [hasBlurred, setHasBlurred] = useState(false);
    const onRulesResolvedRef = useRef<(() => void) | null>(null);

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

    // Declarative rules (minLength, required, etc.) are spread into the
    // rules object during useMemo, so they need a full re-render before
    // RHF sees them. This effect fires the onRulesResolved callback once
    // hasBlurred flips and the memo has recomputed with final rules included.
    useEffect(() => {
        if (onRulesResolvedRef.current) {
            const cb = onRulesResolvedRef.current;
            // ensure we don't call this again until the next blur triggers it
            onRulesResolvedRef.current = null;
            cb();
        }
    }, [hasBlurred]);

    const blurValidation = useCallback((onRulesResolved?: () => void) => {
        onRulesResolvedRef.current = onRulesResolved ?? null;
        setHasBlurred(true);
    }, []);

    const focusValidation = useCallback(() => {
        setHasBlurred(false);
    }, []);

    return { rules, blurValidation, focusValidation };
}
