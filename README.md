- To create a bundle for download you need to prepare a "Release" version: https://github.com/metasyntaktiker/PnS2/releases/tag/0.1.1
    - Also attach a binary file, which is simply the `system.json` file
Manifest-URL for foundry install https://github.com/metasyntaktiker/PnS2/releases/download/0.1.0/system.json

## Development checks

Node.js 18 or newer is required. No third-party packages are needed.

- Run the automated tests with `npm test`.
- Run JavaScript syntax checks and the automated tests with `npm run check`.
- Tests use Node's built-in test runner and cover the three German import examples, import field mappings and talent alternatives, plus the Foundry manifest and localization JSON.
- For Foundry-specific sheet behavior, manually smoke-test in a disposable Foundry world; the automated tests do not emulate Foundry's runtime.