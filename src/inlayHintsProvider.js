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
    // Track in-progress requests to prevent overlapping processing
    this.activeRequests = new Map();
  }

  /**
   * Refresh all inlay hints and clear the function signature cache
   */
  refresh() {
    this.functionDictionary.clear();
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

    const text = document.getText();
    const uriStr = document.uri.toString();
    const activeEditor = vscode.window.activeTextEditor;

    if (!activeEditor || activeEditor.document !== document) {
      return [];
    }

    // Cancel any previous request for this document
    const existingRequest = this.activeRequests.get(uriStr);
    if (existingRequest) {
      existingRequest.cancel = true;
    }

    // Create a new request tracker
    const currentRequest = { cancel: false };
    this.activeRequests.set(uriStr, currentRequest);

    let functionGroups = [];
    const hintOnlyLine = config.get('hintOnlyLine');
    const hintOnlyLiterals = config.get('hintOnlyLiterals');
    const hintOnlyVisibleRanges = config.get('hintOnlyVisibleRanges');

    try {
      functionGroups = await this.functionGroupsFacade.get(uriStr, text);
    } catch (err) {
      printError(err);
      this.activeRequests.delete(uriStr);
      return [];
    }

    // Check if this request was cancelled while parsing
    if (currentRequest.cancel || token.isCancellationRequested) {
      this.activeRequests.delete(uriStr);
      return [];
    }

    if (!functionGroups.length) {
      this.activeRequests.delete(uriStr);
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

    // Check for cancellation after filtering
    if (currentRequest.cancel || token.isCancellationRequested) {
      this.activeRequests.delete(uriStr);
      return [];
    }

    // Convert to InlayHints
    const inlayHints = [];
    const maxHintsPerRequest = 500; // Limit number of hints to prevent excessive API calls

    for (const functionGroup of finalFunctionGroups) {
      if (currentRequest.cancel || token.isCancellationRequested) {
        break;
      }

      // Stop processing if we've reached the limit
      if (inlayHints.length >= maxHintsPerRequest) {
        break;
      }

      let hints;
      try {
        hints = await getHints(this.functionDictionary, functionGroup, activeEditor);
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

    // Clean up the request tracker
    this.activeRequests.delete(uriStr);

    return inlayHints;
  }
}

module.exports = PhpParameterInlayHintsProvider;
