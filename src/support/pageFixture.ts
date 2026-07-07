import { Page } from "@playwright/test";
import { Logger } from "winston";

export const fixture = {
    page: undefined as Page,
    logger: undefined as Logger,
    testData: {} as Record<string, any>,   // scenario-level test data
    env: "" as string,                     // ✅ environment (staging, prod, etc.)
    subStepLogger: undefined as any,
    pages: {} as Record<string, any>,
};
