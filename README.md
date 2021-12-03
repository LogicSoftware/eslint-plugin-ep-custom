eslint-plugin-ep-custom
---
This package includes custom eslint rules for EP application.

Installation
---
The package is stored at npm registry. To add it into an existing project, use the npm CLI:

```
npm i @logicsoftware/eslint-plugin-ep-custom
```

Contribution
---
If you modify the source code in `src` folder, run `npm run build` to update the dist folder. ESlint only works
with `.js` code, so it's necessary to compile typescript source to javascript. Publish the changes to the npm registry.

# Rules
## Cross-feature modules
This rule checks whether the module uses files from other "feature". Feature are calculated as a folder in `baseUri` (e.g. `src/Scripts`).

## Configuration

In `.eslintrc.js` file, add the following configuration to `exports.overrdes` section (with corresponding file masks):

```json5
{
  "rules": {
    "@logicsoftware/ep-custom/no-cross-feature-imports": [
      "error",
      {
        ignoreFeatures: [
          // ...
        ],
        allowedImports: [
          // ...
        ],
        aliases: {
          // ...
        },
        baseUrl: "..."
      }
    ]
  }
}
```

* `baseUri` - the base URI of the project (`src/Scripts`)
* `ignoreFeatures` - all files from within ignored features will be ignored by the rule
* `allowedImports` - all imports from within allowed features will be allowed by the rule
* `aliases` - map of aliases to be used by webpack/ts/jest module loader.


## Example config

```json5
{
  ignoreFeatures: ["app", "Tests", "QUnit"],
  allowedImports: ["common", "const", "EasyProjects" ],
  aliases: {
    "~": "."
  },
  baseUrl: "src/Scripts/"
}
```


