declare global {
    namespace NodeJS {
        interface ProcessEnv {
            postgres_path: string;
            postgres_user: string;
            postgres_pass: string;
            postgres_db: string;
        }
    }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
