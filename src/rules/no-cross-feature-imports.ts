import {Rule} from "eslint";
import {ImportDeclaration, ImportExpression} from "estree";
import * as path from "path";

export type CheckCrossFeatureOptions = {
    ignoreFeatures: string[];
    allowedImports: string[];
    baseUri: string;
    aliases: { [key: string]: string };
};

type CheckCrossFeatureParams = {
    node: (ImportDeclaration | ImportExpression) & Rule.NodeParentExtension;
    currentFeature: string;
    sourceFileName: string;
    options: CheckCrossFeatureOptions;
    context: Rule.RuleContext;
}

let root = "";
let aliases: { [alias: string]: string } = {};

const rule: Rule.RuleModule = {
    meta: {
        type: "suggestion",
        schema: [
            {
                type: "object",
                properties: {
                    baseUri: { type: "string" },
                    allowedImports: {
                        type: "array",
                        items: { type: "string" },
                    },
                    ignoreFeatures: {
                        type: "array",
                        items: { type: "string" },
                    },
                    aliases: {
                        type: "object",
                        additionalProperties: { type: "string" },
                    },
                },
                required: ["allowedImports", "ignoreFeatures"],
                additionalProperties: false,
            },
        ],
    },
    create: (context: Rule.RuleContext) => {
        const options: CheckCrossFeatureOptions = Object.assign({}, {
            baseUri: "./src/Scripts/",
            aliases: {}
        }, context.options[0]);
        aliases = options.aliases;

        if (!options.allowedImports || !options.ignoreFeatures) {
            throw new Error("The rule should contain next config: { allowedImports: string[], ignoreFeatures: string[] }");
        }

        const sourceFileName = context.filename;

        if (!root) {
            const baseUrl = path.normalize(options.baseUri);

            const index = sourceFileName.indexOf(baseUrl) + baseUrl.length;
            root = sourceFileName.substring(0, index);
        }

        const relativePath = path.relative(root, sourceFileName);
        const currentFeature = getFeature(relativePath);

        if (options.ignoreFeatures.includes(currentFeature)) {
            return {};
        }

        return {
            ImportDeclaration(node) {
                checkCrossFeature({node, currentFeature, sourceFileName, options, context})
            },
            ImportExpression(node) {
                checkCrossFeature({node, currentFeature, sourceFileName, options, context})
            },
        }
    },
};

const applyAliases = (importPath: string, sourceFileFolder: string) => {
    for (const [alias, aliasPath] of Object.entries(aliases) as [string, string][]) {
        if (importPath.startsWith(alias + '/')) {
            let fullPath = path.resolve(aliasPath, root);
            let relativePath = path.relative(sourceFileFolder, fullPath);

            return importPath.replace(alias, relativePath.replace(/\\/g, '/'));
        }
    }
    return importPath;
};

const checkCrossFeature = ({node, currentFeature, sourceFileName, options, context}: CheckCrossFeatureParams) => {
    let sourceFileFolder = path.dirname(sourceFileName);

    // @ts-ignore
    let importPath = node.source.value as string;

    let fixedImportPath = applyAliases(importPath, sourceFileFolder);

    if (fixedImportPath.startsWith(".")) {
        let fullImportPath = path.resolve(sourceFileFolder, fixedImportPath);
        let relativeFeaturePath = path.relative(root, fullImportPath);
        let importedFeature = getFeature(relativeFeaturePath);

        if (importedFeature && currentFeature !== importedFeature && !options.allowedImports.includes(importedFeature)) {
            context.report({
                node,
                // @ts-ignore
                message: `found cross feature import: ${node.source.value}. Move needed code to shared dir`
            })
        }
    }
}

const getFeature = (relativePath: string) => {
    // ignore styles import
    if (relativePath[0] === ".") {
        return "";
    }
    const index = relativePath.indexOf(path.sep);
    return index === -1 ? "" : relativePath.substring(0, index);
};

export default rule;
