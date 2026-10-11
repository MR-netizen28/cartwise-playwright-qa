# Publish and add to LinkedIn Featured

## Prepare the evidence

Run the README commands. Review the app and tests, then have Monica implement and explain a genuine change. Update `VALIDATION.md` with her environment, date, command and actual results. Do not upload contact details or traces captured while browsing real accounts.

## Publish on GitHub

1. Sign in to Monica's GitHub account.
2. Create a public repository named `cartwise-playwright-qa`.
3. Upload the contents of this project folder, including `.github/workflows/tests.yml` and `.gitignore`.
4. Exclude `node_modules`, generated reports and test results from source uploads.
5. Open Actions and verify the run; never add a passing badge before the workflow passes.
6. Optionally attach a reviewed report screenshot or demo to the README using fictional data.

The project has not been published. No repository URL or passing CI badge is supplied or invented.

## LinkedIn Featured draft

After publishing and reviewing the project, add the public repository link through Profile → Add section → Recommended → Add featured → Add a link. Available labels can vary.

**Title:** CartWise — Playwright UI and API Testing Portfolio

**Description:** Independent, AI-assisted QA demo for a fictional shopping app. Includes reusable page objects, UI regression scenarios, API validation, negative cases and a GitHub Actions workflow. The README documents actual test results and remaining validation.

Do not claim all-browser passes until they have run successfully. Do not position the project as Maersk/TCS work. The public repository is the shareable evidence; a local ZIP alone cannot serve as a public Featured link.

## Discussion prompts for Monica

- Why are UI expected prices fixed rather than computed by the app's own helper?
- Why can the API receive an invalid quantity even when the UI disables increment?
- How does each UI test start with isolated browser storage?
- What does the request fixture validate that UI-only testing would miss?
- How would real inventory reservation and payment processing change the design?
- Which failures belong to test code, the demo app, or the environment?
