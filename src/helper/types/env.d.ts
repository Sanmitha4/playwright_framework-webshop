export { };

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            BROWSER: "chrome" | "firefox" | "webkit",
            ENV: "STG" | "PRD" | "DEV",
            BASEURL: string,
            HEAD: "true" | "false"
        }
    }
}