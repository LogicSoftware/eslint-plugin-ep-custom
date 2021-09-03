import { Rule } from "eslint";
import { ImportDeclaration, ImportExpression } from "estree";

type Options = {
    ignoreFeatures: string[];
    allowedImports: string[];
};

type CheckCrossFeatureParams = {
    node: (ImportDeclaration | ImportExpression) & Rule.NodeParentExtension;
    importToRootStart: string;
    options: Options;
    context: Rule.RuleContext;
}

let root = "";

const rule: Rule.RuleModule = {
    create: (context: Rule.RuleContext) => {
        const options: Options = context.options[0] || {};
        
        if (!options.allowedImports || !options.ignoreFeatures) {
            throw new Error("The rule should contain next config: { allowedImports: string[], ignoreFeatures: string[] }");
        }

        const sourceFileName = context.getFilename().replace(/\\/g, "/");

        if (!root) {
            const index = sourceFileName.indexOf("src/Scripts/") + "src/Scripts/".length;
            root = sourceFileName.substring(0, index);
        }

        const relativePath = sourceFileName.substring(root.length);
        const currentFeature = getFeature(relativePath);

        if (options.ignoreFeatures.includes(currentFeature)) {
            return {};
        }

        const importToRootStart = getImportToRootStart(relativePath);

        return {
            ImportDeclaration(node) {
                checkCrossFeature({ node, importToRootStart, options, context })
            },
            ImportExpression(node) {
                checkCrossFeature({ node, importToRootStart, options, context })
            },
        }
    },
};

const checkCrossFeature = ({ node, importToRootStart, options, context }: CheckCrossFeatureParams) => {
    // @ts-ignore
    let importPath = node.source.value as string;
    // remove leading './'
    if (importPath.startsWith("./..")) {
        importPath = importPath.substr(2);
    }

    if (importPath.startsWith(importToRootStart)) {
        const feature = getFeature(importPath.substring(importToRootStart.length));

        if (feature && !options.allowedImports.includes(feature)) {
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
    const index = relativePath.indexOf("/");
    return index === -1 ? "" : relativePath.substring(0, index);
};

const importStartHashByDepth: { [key: number]: string} = {
    0: "allow_any_imports_from_root",
};

const getImportToRootStart = (relativePath: string) => {
    const depth = findFileDepth(relativePath);
    return importStartHashByDepth[depth] || (importStartHashByDepth[depth] = createImportRootStart(depth));
};

const createImportRootStart = (depth: number) => {
    const array = new Array(depth);
    array.fill("..");
    return array.join("/") + "/";
};

const findFileDepth = (relativePath: string) => {
    let count = 0;
    for (const c of relativePath) {
        if (c === "/") {
            count++;
        }
    }
    return count;
};

export default rule;
