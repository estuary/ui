import type {
    FieldPath,
    FieldValues,
    PathValue,
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
    onBlur: () => void;
    /**
     * Call INSTEAD of field.onChange. Sets the value via setValue with
     * shouldValidate: false so RHF never evaluates final declarative rules
     * during change. Validation is then triggered with the correct rule set.
     */
    onChange: (value: PathValue<TFieldValues, TName>) => void;
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
    const { trigger, setValue } = useFormContext<TFieldValues>();
    // init finalEnabled to true to ensure all validation rules (partial+final)
    // are registered when the form renders and formState.isValid is correct
    // (i.e. not valid, so the submit button is disabled, etc)
    const [finalEnabled, setFinalEnabled] = useState(true);
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

        // RHF's register() merges new options on top of existing _f via
        // spread, so omitting a rule doesn't remove it — the old value
        // persists from the previous registration. We must explicitly set
        // each final-only key to undefined to overwrite stale values.
        const nullifiedFinal = Object.fromEntries(
            Object.keys(finalDeclarative)
                .filter((key) => !(key in partialDeclarative))
                .map((key) => [key, undefined])
        );

        return {
            ...partialDeclarative,
            ...(finalEnabled ? finalDeclarative : nullifiedFinal),
            validate: {
                ...partialValidators,
                ...(finalEnabled ? finalValidators : {}),
            },
        };
    }, [partialRules, finalRules, finalEnabled]);

    // Trigger validation after the rules memo has recomputed following
    // a hasBlurred change. This ensures RHF sees the correct rule set.
    useEffect(() => {
        if (shouldTriggerRef.current) {
            shouldTriggerRef.current = false;
            void trigger(name);
        }
    }, [finalEnabled, trigger, name]);

    const onBlur = useCallback(() => {
        shouldTriggerRef.current = true;
        // setting finalEnabled here will trigger the useEffect above, which will
        // check shouldTriggerRef and trigger validation with both partial and full rules
        setFinalEnabled(true);
    }, []);

    const onChange = useCallback(
        (value: PathValue<TFieldValues, TName>) => {
            // Set the value WITHOUT triggering RHF's internal validation,
            // as field.onChange would validate immediately using the currently
            // registered rules, which include final declarative rules
            // (required, minLength, etc.) after a blur. By using setValue
            // with shouldValidate: false, we ensure those rules never fire on change.
            setValue(name, value, {
                shouldValidate: false,
                shouldDirty: true,
            });

            if (!finalEnabled) {
                // Already in partial-only mode — rules are correct, trigger immediately.
                void trigger(name);
                return;
            }
            // Switch to partial-only mode and defer trigger until rules recompute.
            shouldTriggerRef.current = true;
            // setting finalEnabled here will trigger the useEffect above, which will
            // check shouldTriggerRef and trigger validation with only the partial rules
            setFinalEnabled(false);
        },
        [name, setValue, trigger, finalEnabled]
    );

    return {
        rules,
        onBlur,
        onChange,
    };
}
