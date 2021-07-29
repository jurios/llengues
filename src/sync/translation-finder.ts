import { promises as fs } from 'fs';
export type TranslationMetadata = {
  text: string;
  files: string[];
};
import { AST, AST_NODE_TYPES, TSESTree, parse } from '@typescript-eslint/typescript-estree';
import { visitNode } from '../utils/visit-node';

export class TranslationFinder {
  static async find(
    files: string[],
    funcName: string,
    packageName: string,
  ): Promise<TranslationMetadata[]> {
    const promises: Promise<TranslationMetadata[]>[] = [];

    files.forEach((file) => {
      promises.push(this.findInFile(file, funcName, packageName));
    });

    const results: TranslationMetadata[][] = await Promise.all(promises);

    return results.reduce((reduced: TranslationMetadata[], current: TranslationMetadata[]) => {
      current.forEach((metadata) => {
        const existing: TranslationMetadata = reduced.filter(
          (item) => item.text === metadata.text,
        )[0];

        if (existing) {
          const index: number = reduced.indexOf(existing);
          reduced[index].files = reduced[index].files.concat(metadata.files);
        } else {
          reduced.push(metadata);
        }
      });

      return reduced;
    }, []);
  }

  protected static async findInFile(
    file: string,
    originalFuncName: string,
    packageName: string,
  ): Promise<TranslationMetadata[]> {
    const translations: string[] = [];
    const content: string = (await fs.readFile(file)).toString();
    const node: AST<unknown> = parse(content);

    const funcName: string = this.findCallExpression(node, originalFuncName, packageName);

    if (funcName === null) {
      return [];
    }

    visitNode(node, (node: TSESTree.CallExpression) => {
      if (
        node.type === 'CallExpression' &&
        node.callee.type === 'Identifier' &&
        node.callee.name === funcName &&
        node.arguments[0].type === 'Literal'
      ) {
        translations.push(node.arguments[0].value as string);
      }
    });

    return translations
      .reduce((reduced: string[], current: string) => {
        if (!reduced.includes(current)) {
          reduced.push(current);
        }

        return reduced;
      }, [])
      .map((translation) => ({
        text: translation,
        files: [file],
      }));
  }

  protected static findCallExpression(
    node: AST<unknown>,
    originalFuncName: string,
    packageName: string,
  ): string {
    let funcName: string = null;

    visitNode(node, (node: TSESTree.ImportDeclaration | TSESTree.VariableDeclarator) => {
      //Detect import { originalFuncName } from 'package'
      //Detect import { originalFuncName as alias } from 'package'
      if (node.type === AST_NODE_TYPES.ImportDeclaration && node.source.value === packageName) {
        node.specifiers.forEach((item) =>
          visitNode(item, (visited: TSESTree.ImportSpecifier) => {
            if (
              visited.type === AST_NODE_TYPES.ImportSpecifier &&
              visited.imported.name === originalFuncName
            ) {
              funcName = visited.local.name;
            }
          }),
        );
      }

      //Detect const alias = import('package').tr;
      if (
        funcName === null &&
        node.type === AST_NODE_TYPES.VariableDeclarator &&
        node.init &&
        node.init.type === AST_NODE_TYPES.MemberExpression &&
        node.init.object.type === AST_NODE_TYPES.CallExpression &&
        ((node.init.object as TSESTree.CallExpression).callee as TSESTree.Identifier).name ===
          'require' &&
        ((node.init.object as TSESTree.CallExpression).arguments[0] as TSESTree.StringLiteral)
          .value === packageName &&
        (node.init.property as TSESTree.Identifier).name === originalFuncName
      ) {
        funcName = (node.id as TSESTree.Identifier).name;
      }
    });

    return funcName;
  }
}
