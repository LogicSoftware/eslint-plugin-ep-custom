import rule from "./no-cross-feature-imports"
import {Rule} from "eslint";
import {ImportDeclaration} from "estree";
import NodeParentExtension = Rule.NodeParentExtension;
// import {Rule} from "eslint";

describe("no-cross-feature-imports", () => {
    test.each`
    module                   | allow         | name
    ${"react"}               | ${'allowed'}  | ${'direct import of node module'}
    ${"./local"}             | ${'allowed'}  | ${'local file'}
    ${"./subFolder/local"}   | ${'allowed'}  | ${'file in subFolder'}
    ${"../parent"}           | ${'allowed'}  | ${'one level up'}
    ${"../../app/reducers"}  | ${'denied'}   | ${'in app folder'}
    ${"~/app/reducers"}      | ${'denied'}   | ${'in app folder by alias'}
    ${"../allowed/reducers"} | ${'allowed'}  | ${'allowed feature'}
    ${"~/allowed/reducers"}  | ${'allowed'}  | ${'allowed feature by alias'}
    `
    ('$name should $allow', ({module, allow}) => {
        let context = {
            options: [
                {
                    allowedImports: ["allowed"],
                    ignoreFeatures: ["ignoredFeature"],
                    baseUri: "./src/Scripts",
                    aliases: {"~": "."}
                }
            ],
            getFilename() {
                return "C:\\Projects\\EPFrontend\\src\\Scripts\\Reports\\ReportsList\\index.tsx";
            },
            report: jest.fn(),
        };
        const result = rule.create(context as any as Rule.RuleContext)

        result.ImportDeclaration!({
            source: {
                value: module
            },
        } as ImportDeclaration & NodeParentExtension);

        if (allow == "denied") {
            expect(context.report).toBeCalled()
        } else {
            expect(context.report).not.toBeCalled()
        }
    });
});