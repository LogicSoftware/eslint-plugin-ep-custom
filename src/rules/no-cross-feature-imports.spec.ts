import { RuleTester } from "eslint"
import rule, { CheckCrossFeatureOptions } from "./no-cross-feature-imports";
import ValidTestCase = RuleTester.ValidTestCase;
import InvalidTestCase = RuleTester.InvalidTestCase;
import * as path from "path";


describe("dummy to allow tests starting from ide", () => { })

const ruleTester: RuleTester = new RuleTester({
    parser: require.resolve('@typescript-eslint/parser'),
});

const root = "c:/projects/front/src/Scripts";

interface ValidCase extends ValidTestCase {
    options?: Partial<CheckCrossFeatureOptions>;
    only?: boolean,
}

interface InvalidCase extends InvalidTestCase {
    options?: Partial<CheckCrossFeatureOptions>;
    only?: boolean,
}

const validCase = ({ options, filename, ...rest }: Partial<ValidCase>) => ({
    ...rest,
    filename: path.normalize(filename!),
    options: [{ allowedImports: [], ignoreFeatures: [], aliases: { "~": "." }, ...options }],
} as ValidTestCase);

const invalidCase = ({ errors = 1, ...rest }: Partial<InvalidCase>) => ({
    ...validCase(rest),
    errors,
});

ruleTester.run("no-cross-feature-imports", rule, {
    valid: [
        // import from node_modules
        validCase({
            filename: `${root}/Feature1/state/selectors.ts`,
            code: `import React from "react";`,
        }),

        // import one level up
        validCase({
            filename: `${root}/Feature1/state/selectors.ts`,
            code: `import { test } from "../actions"`,
        }),

        // import local file
        validCase({
            filename: `${root}/Feature1/state/selectors.ts`,
            code: `import { test } from "./actions"`,
        }),

        // import file in subfolder
        validCase({
            filename: `${root}/Feature1/state/selectors.ts`,
            code: `import { test } from "./utils/local"`,
        }),

        // from feature with allowed cross imports
        validCase({
            filename: `${root}/app/index.ts`,
            code: `import { test } from "../feature1/module.ts";`,
            options: { ignoreFeatures: ["app"] },
        }),

        // allow import shared features
        validCase({
            filename: `${root}/feature1/index.ts`,
            code: `import { test } from "../shared/module.ts";`,
            options: { allowedImports: ["shared"] },
        }),

        // allow import styles
        validCase({
            filename: `${root}/Feature1/index.ts`,
            code: `import "../../Content/styles.css"`,
            only: true,
        }),

        // deep case
        validCase({
            filename: `${root}/Feature1/SubFeature1/state/selectors.ts`,
            code: `import { test } from "../../SubFeature2/actions.ts"`,
        }),

        // imports of current feature with root alias
        validCase({
            filename: `${root}/Feature1/state/selectors.ts`,
            code: `import { test } from "~/Feature1/actions.ts"`,
        }),
    ],

    invalid: [
        // import from another feature
        invalidCase({
            filename: `${root}/Feature1/state/selectors.ts`,
            code: `import { test } from "../../Feature2/actions.ts"`,
        }),

        // import expression check
        invalidCase({
            filename: `${root}/Feature1/state/selectors.ts`,
            code: `const test = await import("../../Feature2/actions.ts");`,
        }),

        // import that starts with relative path
        invalidCase({
            filename: `${root}/Feature1/state/selectors.ts`,
            code: `import { test } from "./../../Feature2/actions.ts"`,
        }),

        // deep case
        invalidCase({
            filename: `${root}/Feature1/SubFeature1/state/selectors.ts`,
            code: `import { test } from "../../../Feature2/actions.ts"`,
        }),

        // imports of another feature with root alias
        invalidCase({
            filename: `${root}/Feature1/state/selectors.ts`,
            code: `import { test } from "~/Feature2/actions.ts"`,
        }),
    ]
});
