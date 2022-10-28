// Basic props required for hydration
export interface HydrationProps {
    hydrated: boolean;
    setHydrated: (value: boolean) => void;

    hydrationErrorsExist: boolean;
    setHydrationErrorsExist: (value: boolean) => void;
}
