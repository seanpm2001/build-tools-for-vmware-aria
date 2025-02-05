/*
 * #%L
 * vrotsc
 * %%
 * Copyright (C) 2023 VMware
 * %%
 * Build Tools for VMware Aria
 * Copyright 2023 VMware, Inc.
 * 
 * This product is licensed to you under the BSD-2 license (the "License"). You may not use this product except in compliance with the BSD-2 License.  
 * 
 * This product may include a number of subcomponents with separate copyright notices and license terms. Your use of these subcomponents is subject to the terms and conditions of the subcomponent's license, as noted in the LICENSE file.
 * #L%
 */
namespace vrotsc {
    const ts: typeof import("typescript") = require("typescript");

    export function remediateTypeScript(sourceFile: ts.SourceFile, context: ScriptTransformationContext): ts.SourceFile {
        let changed = false;
        const statements: ts.Statement[] = [];
        copyArray(statements, sourceFile.statements);

        changed = removeUnderscoreUnderscoreESModule(statements) || changed;

        if (changed) {
            sourceFile = ts.updateSourceFileNode(
                sourceFile,
                ts.setTextRange(
                    ts.createNodeArray(statements),
                    sourceFile.statements));
        }

        return sourceFile;

        // Remove a statement generated by the TypeScript transformers.
        // This statement is used only with esModuleInterop=true which we don't use. (Node and ES6 import interop is handled by VROES.require).
        // Statement: Object.defineProperty(exports, "__esModule", { value: true });
        function removeUnderscoreUnderscoreESModule(statements: ts.Statement[]): boolean {
            const index = statements.findIndex(statement => isUnderscoreUnderscoreESModule(statement));
            if (index > -1) {
                statements.splice(index, 1);
                return true;
            }
        }

        function isUnderscoreUnderscoreESModule(node: ts.Node): boolean {
            if (node.kind !== ts.SyntaxKind.ExpressionStatement) {
                return false;
            }

            const { expression } = node as ts.ExpressionStatement;

            if (expression.kind !== ts.SyntaxKind.CallExpression) {
                return false;
            }

            const callExp = expression as ts.CallExpression;

            if (callExp.arguments.length !== 3) {
                return false;
            }

            if (callExp.expression.kind !== ts.SyntaxKind.PropertyAccessExpression) {
                return false;
            }

            const propAccessExp = callExp.expression as ts.PropertyAccessExpression;

            if (!isIdentifier(propAccessExp.expression, "Object")) {
                return false;
            }

            if (!isIdentifier(propAccessExp.name, "defineProperty")) {
                return false;
            }

            if (!isIdentifier(callExp.arguments[0], "exports")) {
                return false;
            }

            if (!isStringLiteral(callExp.arguments[1], "__esModule")) {
                return false;
            }

            if (callExp.arguments[2].kind !== ts.SyntaxKind.ObjectLiteralExpression) {
                return false;
            }

            return true;
        }
    }
}
