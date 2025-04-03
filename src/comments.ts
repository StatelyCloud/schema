import ts from "typescript";
import { SchemaPackage } from "./package_pb.js";

/** Associate a field with its JSDoc comment. */
export interface FieldCommentBinding {
  /**
   * The name of the field. We can't use the number because we don't know it
   * yet.
   */
  name: string;
  /**
   * The comment. Fields without comments should not be included in
   * CommentBinding#fields.
   */
  comment: string;
}

/**
 * Associate a type with its top level JSDoc comment and field comments.
 */
export interface CommentBinding {
  /**
   * The kind of type this is. This would be useful if we wanted to distinguish
   * two identically-named types, which I don't think can actually happen.
   */
  type: "itemType" | "objectType" | "enumType" | "alias";
  /**
   * The name of the type (e.g. "Person" for `itemType("Person", { ... })`).
   */
  name: string;
  /**
   * The top-level JSDoc comment for the type, if there is one. This is optional
   * because an undocumented type may still have documented fields.
   */
  comment?: string;
  /**
   * The comments for each field of the type. If a field is not documented, it
   * should not be included here.
   */
  fields: Record<string, FieldCommentBinding>;
}

/**
 * Find a child node of a given kind within the given node. This does some
 * recursion to try and find the node deeper in the tree if necessary.
 */
// TODO: make this a recursive search with a predicate
function findChildOfType<T extends ts.Node>(node: ts.Node, kind: ts.SyntaxKind): T | undefined {
  if (node.kind === kind) {
    return node as T;
  }
  for (const child of node.getChildren()) {
    if (child.kind === kind) {
      return child as T;
    } else if (
      child.kind === ts.SyntaxKind.SyntaxList ||
      child.kind === ts.SyntaxKind.SourceFile ||
      child.kind === ts.SyntaxKind.ReturnStatement
    ) {
      const found = findChildOfType<T>(child, kind);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

/**
 * Get the name of a property or variable binding as a string. This is used to
 * identify fields and types by name.
 */
function getNameAsString(node: ts.PropertyName | ts.BindingName): string | undefined {
  switch (node.kind) {
    case ts.SyntaxKind.Identifier:
      return node.escapedText as string;
    case ts.SyntaxKind.StringLiteral:
      return node.text;
    default:
      return undefined;
  }
}

/**
 * Process the fields of a type, extracting the JSDoc comments for each field.
 */
function processFields(fields: ts.ObjectLiteralExpression): Record<string, FieldCommentBinding> {
  const fieldMap: Record<string, FieldCommentBinding> = {};
  for (const prop of fields.properties) {
    if (prop.kind !== ts.SyntaxKind.PropertyAssignment) {
      continue;
    }
    const name = getNameAsString(prop.name);
    const comment = extractJSDoc(prop);
    if (!name || !comment) {
      continue;
    }
    fieldMap[name] = {
      name,
      comment,
    };
  }
  return fieldMap;
}

/**
 * Extract the JSDoc comment from a node (or certain children of the node), if
 * there is one.
 */
function extractJSDoc(node: ts.Node): string | undefined {
  const jsDocComment = findChildOfType<ts.JSDoc>(node, ts.SyntaxKind.JSDoc);
  if (jsDocComment) {
    return typeof jsDocComment.comment === "string" ? jsDocComment.comment : jsDocComment.getText();
  }
  return undefined;
}

/**
 * Take a function declaration and see if it contains a call to `itemType`,
 * `objectType`, etc. If so, extract type and field comments.
 */
function processFunctionDeclaration(
  node: ts.FunctionDeclaration | ts.ArrowFunction,
): CommentBinding | undefined {
  if (!node.body) {
    return;
  }
  const callExpression = findChildOfType<ts.CallExpression>(
    node.body,
    ts.SyntaxKind.CallExpression,
  );
  if (!callExpression) {
    return;
  }
  const callInfo = processCallExpression(callExpression);
  if (callInfo) {
    const jsDoc = extractJSDoc(node);
    if (jsDoc) {
      callInfo.comment = appendComment(callInfo.comment, jsDoc);
    }
    return callInfo;
  }
}

/**
 * Given a function call, if it's one of our type factories, extract the type and field comments.
 */
function processCallExpression(callExpression: ts.CallExpression): CommentBinding | undefined {
  const functionName = (callExpression.expression as ts.Identifier).escapedText;
  if (functionName === "itemType" || functionName === "objectType" || functionName === "enumType") {
    const info: CommentBinding = {
      type: "itemType",
      name: "Unknown",
      comment: extractJSDoc(callExpression),
      fields: {},
    };
    // Our type factories take two arguments: the type name and an options object.
    if (callExpression.arguments.length !== 2) {
      return;
    }
    info.type = functionName as "itemType" | "objectType" | "enumType";
    const typeNameArg = callExpression.arguments[0];
    if (typeNameArg.kind === ts.SyntaxKind.StringLiteral) {
      info.name = (typeNameArg as ts.StringLiteral).text;
    } else {
      return;
    }
    const optsArg = callExpression.arguments[1];
    if (optsArg.kind === ts.SyntaxKind.ObjectLiteralExpression) {
      const obj = optsArg as ts.ObjectLiteralExpression;
      if (functionName === "enumType") {
        info.fields = processFields(optsArg as ts.ObjectLiteralExpression);
      } else {
        const fields = obj.properties.find(
          (prop) =>
            prop.kind === ts.SyntaxKind.PropertyAssignment &&
            prop.name.kind === ts.SyntaxKind.Identifier &&
            prop.name.escapedText === "fields" &&
            prop.initializer.kind === ts.SyntaxKind.ObjectLiteralExpression,
        ) as ts.PropertyAssignment | undefined;
        if (fields) {
          info.fields = processFields(fields.initializer as ts.ObjectLiteralExpression);
        }
      }
    }
    return info;
  }
}

/**
 * Process a variable declaration, looking for either an arrow function
 * declaration or a direct call to itemType, etc.
 */
function processVariableDeclaration(node: ts.VariableDeclaration) {
  if (!node.initializer) {
    return;
  }
  switch (node.initializer.kind) {
    case ts.SyntaxKind.ArrowFunction:
      return processFunctionDeclaration(node.initializer as ts.ArrowFunction);
    case ts.SyntaxKind.CallExpression:
      return processCallExpression(node.initializer as ts.CallExpression);
    default:
      return;
  }
}

/**
 * Look through an entire program and extract all type and field comments from
 * all of its files. This is like a static analyzer - it is figuring out
 * documentation by looking for patterns in the TypeScript AST that match calls
 * to our type factories. It can't actually evaluate the code, so it's limited
 * in what it can detect - for example dynamically generated types won't be
 * detected.
 */
export function extractCommentBindings(program: ts.Program): Record<string, CommentBinding> {
  const commentBindings: Record<string, CommentBinding> = {};

  /**
   * Recursively process a node and its children, looking for type and field comments.
   */
  function processNode(node: ts.Node) {
    if (node.kind === ts.SyntaxKind.FunctionDeclaration) {
      // A function declaration that hopefully returns an invocation of one of our type factories, e.g.:
      // /** This is a Person */
      // function Person() { return itemType("Person", { ... }); }
      const info = processFunctionDeclaration(node as ts.FunctionDeclaration);
      if (info) {
        commentBindings[info.name] = info;
      }
    } else if (node.kind === ts.SyntaxKind.ExpressionStatement) {
      // An expression statement that hopefully contains a call to one of our type factories, e.g.:
      // /** This is a Person */
      // itemType("Person", { ... });
      const expr = (node as ts.ExpressionStatement).expression;
      if (expr.kind === ts.SyntaxKind.CallExpression) {
        const info = processCallExpression(expr as ts.CallExpression);
        if (info) {
          // Check for a JSDoc comment on the expression declaration itself and
          // merge it with the one from the function invocation.
          const jsDoc = extractJSDoc(node);
          if (jsDoc) {
            info.comment = appendComment(info.comment, jsDoc);
          }
          commentBindings[info.name] = info;
        }
      }
    } else if (node.kind === ts.SyntaxKind.VariableStatement) {
      // A variable statement that hopefully contains a call to one of our type factories, e.g.:
      // /** This is a Person */
      // const Person = itemType("Person", { ... });
      for (const declaration of (node as ts.VariableStatement).declarationList.declarations) {
        const info = processVariableDeclaration(declaration);
        if (info) {
          // Check for a JSDoc comment on the variable declaration itself and merge it with the
          // one from the function invocation.
          const jsDoc = extractJSDoc(node);
          if (jsDoc) {
            info.comment = appendComment(info.comment, jsDoc);
          }
          commentBindings[info.name] = info;
        }
      }
    } else if (node.kind === ts.SyntaxKind.ImportDeclaration) {
      // TODO: read imports to find out if they aliased imports of `itemType` et
      // al as something else?
    } else if (node.kind === ts.SyntaxKind.SyntaxList || node.kind === ts.SyntaxKind.SourceFile) {
      // A list of statements or a source file. Dig one level deeper.
      for (const child of node.getChildren()) {
        processNode(child);
      }
    }
  }

  for (const tsFile of program.getSourceFiles()) {
    if (!tsFile.isDeclarationFile) {
      processNode(tsFile);
    }
  }

  return commentBindings;
}

/**
 * Add comments from comment bindings to the schema package. Mutates the package
 * in place.
 */
export function buildSourceCodeInfo(
  pkg: SchemaPackage,
  commentBindings: Record<string, CommentBinding>,
) {
  for (const message of pkg.messages) {
    const commentBinding = commentBindings[message.typeName];
    if (!commentBinding || commentBinding.type === "enumType") {
      continue;
    }
    if (commentBinding.comment) {
      message.comments = appendComment(message.comments, commentBinding.comment);
    }
    for (const [name, binding] of Object.entries(commentBinding.fields)) {
      const field = message.fields.find((f) => f.fieldName === name);
      if (field && binding.comment) {
        field.comments = appendComment(field.comments, binding.comment);
      }
    }
  }
  for (const enumType of pkg.enums) {
    const commentBinding = commentBindings[enumType.typeName];
    if (!commentBinding || commentBinding.type !== "enumType") {
      continue;
    }
    if (commentBinding.comment) {
      enumType.comments = appendComment(enumType.comments, commentBinding.comment);
    }
    for (const [name, binding] of Object.entries(commentBinding.fields)) {
      const value = enumType.values.find((f) => f.shortName === name);
      if (value && binding.comment) {
        value.comments = appendComment(value.comments, binding.comment);
      }
    }
  }
  for (const typeAlias of pkg.typeAliases) {
    const commentBinding = commentBindings[typeAlias.typeName];
    if (!commentBinding || commentBinding.type !== "alias") {
      continue;
    }
    if (commentBinding.comment) {
      typeAlias.comments = appendComment(typeAlias.comments, commentBinding.comment);
    }
  }
}

// This actually prepends the comment, but I wanted it to look like the Go "append" function.
function appendComment(existing: string | undefined, newComment: string): string {
  if (!existing) {
    return newComment;
  }
  return `${newComment}\n\n${existing}`;
}
