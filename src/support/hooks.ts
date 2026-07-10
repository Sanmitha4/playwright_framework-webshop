import {
    BeforeAll,
    AfterAll,
    Before,
    After,
    BeforeStep,
    AfterStep,
    Status
} from "@cucumber/cucumber";
import { Browser, BrowserContext, Page } from "@playwright/test";
import { fixture } from "./pageFixture";
import { invokeBrowser } from "../helper/browsers/browserManager";
import { createLogger } from "winston";
import { options } from "../helper/util/logger";
import { CSVParser } from "../helper/parsers/CSVParser";
import * as fs from "fs-extra";
import * as path from "path";
import { getEnv } from "../helper/env/env";
import { HTMLSubStepLogger } from "./htmllSubStepLogger";
import SauceHomePage from "../pages/sauceHomePage";
import SauceCartPage from "../pages/sauceCartPage";
import SauceSearchPage from "../pages/sauceSearchPage";

// ----------------- Global Variables -----------------
let browser: Browser;
let context: BrowserContext;
let allData: Record<string, string>[] = [];

// ================================================================
// 🧩 BEFORE ALL — Launch Browser once before all features
// ================================================================
BeforeAll(async function () {
    getEnv();
    browser = await invokeBrowser();
    console.log("✅ Browser launched for all tests.");

    // Load CSV once for all scenarios
    const csvFilePath = path.join(__dirname, "../helper/util/test-data/testData.csv");
    allData = await CSVParser.parseData(csvFilePath, '|');
});

// ================================================================
// 🧩 BEFORE SCENARIO — Setup context, page, and data per scenario
// ================================================================
Before(async function ({ pickle }) {
    const scenarioName = `${pickle.name}_${pickle.id}`;
    const env = process.env.ENV || "STG";
    fixture.env = env;

    // Extract Key from scenario tag @Key=XYZ
    const keyTag = pickle.tags.find(tag => tag.name.startsWith("@Key:"));
    const key = keyTag ? keyTag.name.replace("@Key:", "").trim() : null;

    if (key) {
        // 🔹 Find the row matching Key + Env
        const testData = allData.find((row: any) => {
            const csvKey = row.Key ?? row.TestCaseID ?? row.key ?? row.testcaseid;
            const csvEnv = row.Env ?? row.env;
            return csvKey === key && csvEnv?.toLowerCase() === env.toLowerCase();
        });

        if (!testData) throw new Error(`❌ No CSV data found for Key=${key} in Env=${env}`);
        // Parse Group field as JSON if present
        if (testData.Group) {
            try {
                testData.Group = JSON.parse(testData.Group);
            } catch (e) {
                fixture.logger?.error(`Failed to parse Group field as JSON: ${testData.Group}`);
            }
        }
        fixture.testData = testData;

        // Iterate and replace param with actual value for each step (supports nested keys like <Group.name>)
        pickle.steps.forEach((step, index) => {
            pickle.steps[index].text = step.text.replace(/<([\w.]+)>/g, (_, key) => {
                const keys = key.split('.');
                let value: any = testData;
                for (const k of keys) {
                    value = value?.[k];
                }
                // If value is an array, take the first element
                return Array.isArray(value) ? value[0] : value || `<${key}>`;
            });
            // console.log(`After >> Step ${index + 1}: ${step.argument}  ${step.type} ${step.text}`);
        })

        // Create stepArgsMap for dynamic step arguments
        // @ts-ignore
        this.stepArgsMap = new Proxy({}, {
            get: (_, prop: string) => testData[prop] ?? testData[prop.toLowerCase()] ?? `<${prop}>`
        });

        fixture.logger?.info(`🔹 Loaded scenario data → Key: ${key}, Env: ${env}`);
    } else {
        fixture.logger?.info("⚠️ No @Key tag found — skipping CSV data load");
    }
    
    

    // Setup browser context & page
    context = await browser.newContext({
        viewport: null,
        ignoreHTTPSErrors: true, 
        recordVideo: { dir: "test-results/videos" },
    });

    await context.tracing.start({
        name: scenarioName,
        title: pickle.name,
        screenshots: true,
        snapshots: true,
        sources: true,
    });

    const page: Page = await context.newPage();
    fixture.page = page;
    fixture.logger = createLogger(options(scenarioName));
    fixture.logger.info(`🚀 Starting Scenario: ${pickle.name}`);
    // Initialize a single sub-step logger for the scenario and expose via fixture
    // so step definitions can reuse it without rebinding attach every time.
    // Use `this.attach` from the world to attach HTML to the report.
    // @ts-ignore
    this.subStepLogger = new HTMLSubStepLogger(this.attach.bind(this));
    fixture.subStepLogger = this.subStepLogger;
    fixture.logger?.info('Sub-step logger initialized for scenario.');
    // Initialize page objects for this scenario and attach the shared subStepLogger
    fixture.pages = {
        sauceHomePage: new SauceHomePage(fixture.page, fixture.subStepLogger),
        sauceCartPage: new SauceCartPage(fixture.page, fixture.subStepLogger),
        sauceSearchPage: new SauceSearchPage(fixture.page, fixture.subStepLogger),
    };
    fixture.logger?.info('Page objects initialized for scenario.');
});

// ================================================================
// 🧩 STEP HOOKS — Step-wise logging
// ================================================================
BeforeStep(async function ({ pickleStep }) {
    fixture.logger?.info(`🟡 Step started → ${pickleStep.text}`);
});

AfterStep(async function ({ pickleStep, result }) {
    const stepText = pickleStep.text;
    const status = result?.status || "UNKNOWN";

    if (status === Status.PASSED) {
        fixture.logger?.info(`✅ Step passed → ${stepText}`);
    } else if (status === Status.FAILED) {
        fixture.logger?.error(`❌ Step failed → ${stepText}`);
        const screenshot = await fixture.page.screenshot({
            path: `./test-results/screenshots/${Date.now()}_${stepText.replace(/[^a-zA-Z0-9]/g, "_")}.png`,
            type: "png"
        });
        await this.attach(screenshot, "image/png");
    }
});

// ================================================================
// 🧩 AFTER SCENARIO — Attach trace, video, screenshot
// ================================================================
After(async function ({ pickle, result }) {
    const scenarioPath = `./test-results/trace/${pickle.id}.zip`;
    await context.tracing.stop({ path: scenarioPath });

    if (result?.status === Status.PASSED) {
        const img = await fixture.page.screenshot({ path: `./test-results/screenshots/${pickle.name}.png`, type: "png" });
        await this.attach(img, "image/png");

        const videoPath = await fixture.page.video()?.path();
        if (videoPath && fs.existsSync(videoPath)) {
            await this.attach(fs.readFileSync(videoPath), "video/webm");
        }

        await this.attach(`<a href="https://trace.playwright.dev/" target="_blank">Open Trace</a>`, "text/html");
    } else if (result?.status === Status.FAILED) {
        fixture.logger?.error(`❌ Scenario failed: ${pickle.name}`);
    }

    await fixture.page.close();
    await context.close();
});

// ================================================================
// 🧩 AFTER ALL — Close browser
// ================================================================
AfterAll(async function () {
    await browser.close();
    console.log("🧹 Browser closed after all scenarios.");
});
