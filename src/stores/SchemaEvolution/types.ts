export interface SchemaEvolutionState {
    // Capture Auto Discovery Settings
    addNewBindings: boolean;
    setAddNewBindings: (
        value: SchemaEvolutionState['addNewBindings'],
        options?: { initOnly: boolean }
    ) => void;

    evolveIncompatibleCollections: boolean;
    setEvolveIncompatibleCollections: (
        value: SchemaEvolutionState['evolveIncompatibleCollections'],
        options?: { initOnly: boolean }
    ) => void;

    settingsActive: boolean;
    setSettingsActive: (value: SchemaEvolutionState['settingsActive']) => void;

    settingsSaving: boolean;
    setSettingsSaving: (value: SchemaEvolutionState['settingsSaving']) => void;

    // Misc.
    resetState: () => void;
}
