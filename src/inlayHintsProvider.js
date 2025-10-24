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
    this._onDidChangeInlayHints = new vscode.EventEmitter();
    this.onDidChangeInlayHints = this._onDidChangeInlayHints.event;
    // Cache function signatures to avoid redundant lookups across hint provider calls
    this.functionDictionary = new Map();
    // Track active requests to prevent concurrent processing
    this.activeRequests = new Map();
  }

  /**
   * Refresh all inlay hints and clear the function signature cache
   */
  refresh() {
    this.functionDictionary.clear();
    // Cancel all active requests on refresh
    for (const [, cancellationSource] of this.activeRequests) {
      cancellationSource.cancel();
    }
    this.activeRequests.clear();
    this._onDidChangeInlayHints.fire();
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

    const uriStr = document.uri.toString();

    // Cancel any existing request for this document
    if (this.activeRequests.has(uriStr)) {
      const existingCancellation = this.activeRequests.get(uriStr);
      existingCancellation.cancel();
      this.activeRequests.delete(uriStr);
    }

    // Create a new cancellation token source for this request
    const cancellationSource = new vscode.CancellationTokenSource();
    this.activeRequests.set(uriStr, cancellationSource);

    // Combine the provided token with our internal cancellation
    const checkCancellation = () => {
      return token.isCancellationRequested || cancellationSource.token.isCancellationRequested;
    };

    try {
      const text = document.getText();
      const activeEditor = vscode.window.activeTextEditor;

      if (!activeEditor || activeEditor.document !== document) {
        return [];
      }

      if (checkCancellation()) {
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

      if (checkCancellation()) {
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

      if (checkCancellation()) {
        return [];
      }

      // Convert to InlayHints
      const inlayHints = [];

      for (const functionGroup of finalFunctionGroups) {
        if (checkCancellation()) {
          break;
        }

        let hints;
        try {
          hints = await getHints(this.functionDictionary, functionGroup, activeEditor);
          // eslint-disable-next-line no-unused-vars
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
    } finally {
      // Clean up this request from active requests
      if (this.activeRequests.get(uriStr) === cancellationSource) {
        this.activeRequests.delete(uriStr);
      }
      cancellationSource.dispose();
    }
  }
}

module.exports = PhpParameterInlayHintsProvider;