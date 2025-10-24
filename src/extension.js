const vscode = require('vscode');
const debounce = require('lodash.debounce');
const { Commands } = require('./commands');
const { printError } = require('./printer');
const { update } = require('./update');
const { onlyLiterals, onlySelection, onlyVisibleRanges } = require('./middlewares');
const { Pipeline } = require('./pipeline');
const { CacheService } = require('./cache');
const { FunctionGroupsFacade } = require('./functionGroupsFacade');
const PhpParameterInlayHintsProvider = require('./inlayHintsProvider');

const initialNrTries = 3;

/**
 * This method is called when VSCode is activated
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  let timeout;
  let activeEditor = vscode.window.activeTextEditor;
  const functionGroupsFacade = new FunctionGroupsFacade(new CacheService());

  // Register the InlayHintsProvider for native inlay hints support
  // This approach respects word wrap and works better with VS Code's native features
  const inlayHintsProvider = new PhpParameterInlayHintsProvider();
  const inlayHintsDisposable = vscode.languages.registerInlayHintsProvider(
    { language: 'php' },
    inlayHintsProvider
  );
  context.subscriptions.push(inlayHintsDisposable);

  /**
   * Refresh inlay hints for the active editor
   * Note: VS Code automatically refreshes inlay hints when the provider's
   * onDidChangeInlayHints event is fired or when the document changes.
   * No manual refresh command is needed.
   */
  function refreshInlayHints() {
    // Fire the event to notify VS Code to refresh inlay hints
    inlayHintsProvider.refresh();
  }

  /**
   * Get the PHP code then parse it and create parameter hints
   * This is kept for backwards compatibility but now triggers inlay hints refresh
   */
  async function updateDecorations() {
    timeout = undefined;

    if (!activeEditor || !activeEditor.document || activeEditor.document.languageId !== 'php') {
      return;
    }

    const isEnabled = vscode.workspace.getConfiguration('phpParameterHint').get('enabled');

    // Refresh inlay hints when settings change or when explicitly triggered
    if (isEnabled) {
      refreshInlayHints();
    }
  }

  /**
   * Trigger updating decorations
   *
   * @param {number} delay integer
   */
  function triggerUpdateDecorations(delay = 1000) {
    if (timeout) {
      clearTimeout(timeout);
      timeout = undefined;
    }

    timeout = setTimeout(updateDecorations, delay);
  }

  /**
   * Try creating hints multiple time on activation, in case intelephense
   * extension was not loaded at first
   *
   * @param {number} numberTries integer
   */
  function tryInitial(numberTries) {
    if (!numberTries) {
      setTimeout(triggerUpdateDecorations, 4000);

      return;
    }

    const intelephenseExtension = vscode.extensions.getExtension(
      'bmewburn.vscode-intelephense-client'
    );

    if (!intelephenseExtension || !intelephenseExtension.isActive) {
      setTimeout(() => tryInitial(numberTries - 1), 2000);
    } else {
      setTimeout(triggerUpdateDecorations, 4000);
    }
  }

  vscode.workspace.onDidChangeConfiguration(event => {
    if (event.affectsConfiguration('phpParameterHint')) {
      triggerUpdateDecorations();
    }
  });
  vscode.window.onDidChangeActiveTextEditor(
    editor => {
      activeEditor = editor;
      if (activeEditor) {
        triggerUpdateDecorations(
          vscode.workspace.getConfiguration('phpParameterHint').get('textEditorChangeDelay')
        );
      }
    },
    null,
    context.subscriptions
  );
  const handleVisibleRangesChange = debounce(() => {
    if (
      activeEditor &&
      vscode.workspace.getConfiguration('phpParameterHint').get('hintOnlyVisibleRanges')
    ) {
      triggerUpdateDecorations(0);
    }
  }, 333);
  vscode.window.onDidChangeTextEditorVisibleRanges(
    handleVisibleRangesChange,
    null,
    context.subscriptions
  );
  vscode.window.onDidChangeTextEditorSelection(
    () => {
      if (
        activeEditor &&
        vscode.workspace.getConfiguration('phpParameterHint').get('hintOnlyLine')
      ) {
        triggerUpdateDecorations(0);
      }
    },
    null,
    context.subscriptions
  );
  vscode.workspace.onDidChangeTextDocument(
    debounce(event => {
      if (
        activeEditor &&
        event.document === activeEditor.document &&
        vscode.workspace.getConfiguration('phpParameterHint').get('onChange')
      ) {
        triggerUpdateDecorations(
          vscode.workspace.getConfiguration('phpParameterHint').get('changeDelay')
        );
      }
    }, 333),
    null,
    context.subscriptions
  );
  vscode.workspace.onDidSaveTextDocument(
    document => {
      if (
        activeEditor &&
        activeEditor.document === document &&
        vscode.workspace.getConfiguration('phpParameterHint').get('onSave')
      ) {
        triggerUpdateDecorations(
          vscode.workspace.getConfiguration('phpParameterHint').get('saveDelay')
        );
      }
    },
    null,
    context.subscriptions
  );
  Commands.registerCommands();

  if (activeEditor) {
    tryInitial(initialNrTries);
  }
}

module.exports = {
  activate
};
