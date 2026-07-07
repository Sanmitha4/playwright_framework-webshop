import * as dotenv from "dotenv";
import * as path from "path";
import * as os from "os";
import { generate } from "multiple-cucumber-html-reporter";
import { execSync } from "child_process";
import * as fs from "fs";

/* =====================================
   LOAD ENV FILE
===================================== */
dotenv.config({
  path: path.resolve(__dirname, "../env/.env.PRD"),
});

/* =====================================
   SYSTEM INFO
===================================== */
const deviceName = os.hostname();
const platformName = os.type();
const platformVersion = os.release();

/* =====================================
   ENV VARIABLES (with defaults)
===================================== */
const projectName = process.env.PROJECT || "ChemReMSy";
const releaseVersion = process.env.RELEASE || "1.0.0";
const cycleName = process.env.CYCLE || "Smoke-1";
const baseUrl = process.env.BASEURL || "https://stage.chemremsy.te3985.ec1.aws.contitech.cloud";
const headlessMode = process.env.HEAD || "true";
const browserName = process.env.BROWSER || "chrome";

/* =====================================
   BROWSER VERSION DETECTION
===================================== */
let browserVersion = "Unknown";

try {
  if (browserName.toLowerCase().includes("chrome")) {
    const versionOutput = execSync(
      process.platform === "win32"
        ? 'reg query "HKEY_CURRENT_USER\\Software\\Google\\Chrome\\BLBeacon" /v version'
        : "google-chrome --version || chromium --version",
      { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] }
    );
    const match = versionOutput.match(/\d+\.\d+\.\d+\.\d+/);
    if (match) browserVersion = match[0];
  }

  if (browserName.toLowerCase().includes("edge")) {
    const versionOutput = execSync(
      process.platform === "win32"
        ? 'reg query "HKEY_CURRENT_USER\\Software\\Microsoft\\Edge\\BLBeacon" /v version'
        : "msedge --version",
      { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] }
    );
    const match = versionOutput.match(/\d+\.\d+\.\d+\.\d+/);
    if (match) browserVersion = match[0];
  }

  if (browserName.toLowerCase().includes("firefox")) {
    const versionOutput = execSync("firefox --version", {
      encoding: "utf8",
    });
    const match = versionOutput.match(/\d+\.\d+/);
    if (match) browserVersion = match[0];
  }
} catch (error) {
  console.warn("⚠ Could not detect browser version.");
}

/* =====================================
   REPORT PATHS
===================================== */
const jsonDir = path.resolve("test-results");
const reportDir = path.join(jsonDir, "reports");

if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
}

/* =====================================
   SMART THEME CUSTOMIZATION
===================================== */
const cssContent = `
/* Orange background for Light Mode */
body {
    background-color: #ffa500 !important;
}

/* Fix main container transparency in Light Mode */
.main_container {
    background: #ffffff !important;
    padding: 15px;
    border-radius: 10px;
}

/* DARK MODE OVERRIDES */
/* The reporter usually applies .dark or matches system preferences */
@media (prefers-color-scheme: dark) {
    body {
        background-color: #1a1a1a !important; /* Dark neutral background */
    }
    .main_container, .x_panel {
        background: #2a2a2a !important;
        color: #ffffff !important;
    }
    .x_title {
        color: #ffffff !important;
        border-bottom: 2px solid #ffa500 !important;
    }
    table, th, td {
        color: #ffffff !important;
        border-color: #444 !important;
    }
}

/* Explicit class-based Dark Mode support (if reporter toggles .dark-mode class) */
body.dark-mode {
    background-color: #1a1a1a !important;
}
body.dark-mode .main_container, 
body.dark-mode .x_panel {
    background: #2a2a2a !important;
    color: #ffffff !important;
}

/* Header Styling */
.x_title h2 {
    font-weight: bold;
    color: #333;
}

body.dark-mode .x_title h2 {
    color: #ffa500;
}
`;

const cssPath = path.join(reportDir, "custom-style.css");
fs.writeFileSync(cssPath, cssContent, { encoding: "utf8" });

/* =====================================
   GENERATE REPORT
===================================== */
generate({
  jsonDir: jsonDir,
  reportPath: reportDir,
  reportName: "Automation Report",
  pageTitle: "ChemReMSy Test Results",
  displayDuration: true,
  durationInMS: false,
  removeExistingJsonReport: false,

  metadata: {
    browser: {
      name: browserName,
      version: browserVersion,
    },
    device: deviceName,
    platform: {
      name: platformName,
      version: platformVersion,
    },
  },

  customData: {
    title: "Execution Details",
    data: [
      { label: "Project", value: projectName },
      { label: "Release", value: releaseVersion },
      { label: "Cycle", value: cycleName },
      { label: "Base URL", value: baseUrl },
      { label: "Headless", value: headlessMode },
      { label: "Executed At", value: new Date().toLocaleString() },
    ],
  },

  customStyle: cssPath,
});

console.log("✅ Report Generated Successfully!");