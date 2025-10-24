const vscode = require('vscode');
const { printError } = require('./printer');
const { FunctionGroupsFacade } = require('./functionGroupsFacade');
const { CacheService } = require('./cache');
const { Pipeline } = require('./pipeline');
const { onlyLiterals, onlySelection, onlyVisibleRanges } = require('./middlewares');
const getHints = require('./parameterExtractor');

/**
 * Provides inlay hints for PHP parameter names
 */
class PhpParameterInlayHintsProvider {
  constructor() {
    this.functionGroupsFacade = new FunctionGroupsFacade(new CacheService());
  }

  /**
   * Provide inlay hints for the given document and range
   * @param {vscode.TextDocument} document
   * @param {vscode.Range} range
   * @param {vscode.CancellationToken} token
   * @returns {Promise<vscode.InlayHint[]>}
   */
  async provideInlayHints(document, range, token) {
    if (document.languageId !== 'php') {
      return [];
    }

    const config = vscode.workspace.getConfiguration('phpParameterHint');
    const isEnabled = config.get('enabled');

    if (!isEnabled) {
      return [];
    }

    const text = document.getText();
    const uriStr = document.uri.toString();
    const activeEditor = vscode.window.activeTextEditor;

    if (!activeEditor || activeEditor.document !== document) {
      return [];
    }

    let functionGroups = [];
    const hintOnlyLine = config.get('hintOnlyLine');
    const hintOnlyLiterals = config.get('hintOnlyLiterals');
    const hintOnlyVisibleRanges = config.get('hintOnlyVisibleRanges');

    try {
      functionGroups = await this.functionGroupsFacade.get(uriStr, text);
    } catch (err) {
      printError(err);
      return [];
    }

    if (!functionGroups.length) {
      return [];
    }

    // Apply middlewares to filter function groups
    const finalFunctionGroups = await new Pipeline()
      .pipe(
        [onlyLiterals, hintOnlyLiterals],
        [onlyVisibleRanges, activeEditor, hintOnlyVisibleRanges],
        [onlySelection, activeEditor, hintOnlyLine]
      )
      .process(functionGroups);

    // Convert to InlayHints
    const inlayHints = [];
    const functionDictionary = new Map();

    for (const functionGroup of finalFunctionGroups) {
      if (token.isCancellationRequested) {
        break;
      }

      let hints;
      try {
        hints = await getHints(functionDictionary, functionGroup, activeEditor);
      } catch (err) {
        // Skip this function group if we can't get hints
        continue;
      }

      if (hints && hints.length) {
        for (const hint of hints) {
          const inlayHint = new vscode.InlayHint(
            hint.range.start,
            hint.text,
            vscode.InlayHintKind.Parameter
          );

          // Add padding for better readability
          inlayHint.paddingRight = true;

          inlayHints.push(inlayHint);
        }
      }
    }

    return inlayHints;
  }
}

module.exports = PhpParameterInlayHintsProvider;
