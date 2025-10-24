# Change Log

## [2.2.1]
- **FIX**: Removed non-functional `phpParameterHint.hintForeground` and `phpParameterHint.hintBackground` color contributions
  - These settings were not being applied with the native Inlay Hints API
  - Users should use VS Code's standard `editorInlayHint.foreground` and `editorInlayHint.background` instead
  - See README for instructions on customizing inlay hint colors
  - Named arguments #22
- **REMOVED**: Deprecated configuration settings that no longer work with native inlay hints
  - Removed `opacity`, `borderRadius`, `fontWeight`, `fontStyle`, `margin`, `verticalPadding`, `horizontalPadding`, `fontSize`
  - Use VS Code's native settings: `editor.inlayHints.fontSize`, `editor.inlayHints.fontFamily`, etc.
  - Use `workbench.colorCustomizations` with `editorInlayHint.*` for color customization
- **REMOVED**: Deprecated source files and tests for the old decoration-based hints system
  - Removed `src/hints.js` and `src/update.js` (no longer used)
  - Removed `test/hints.test.js` and `test/update.test.js` (tested deprecated functionality)

## [2.2.0]
- **BREAKING**: Migrated to VS Code's native Inlay Hints API for better word wrap support
- Fixes issue where parameter hints would break word wrap functionality
- Parameter hints now respect word wrap and integrate seamlessly with the editor
- **DEPRECATED**: Custom styling options (opacity, fontSize, fontWeight, etc.) are now deprecated
  - Styling is now controlled by VS Code's theme system via `editorInlayHint.*` settings
- **DEPRECATED**: Custom color settings (`phpParameterHint.hintForeground/Background`) are deprecated
  - Use VS Code's standard `editorInlayHint.foreground/background` theme colors instead
- All existing functionality (toggle commands, filtering options, etc.) continues to work

## [2.1.0]
- Update Extension engine

## 2.0.0

- Fixes [#21](https://github.com/mrchetan/phpstorm-parameter-hints-in-vscode/issues/21) - Bug on single line selection

## 1.4.0

- Update Dependencies to latest versions
- modify keybindings for PHP files

## 1.3.0

- Update Dependencies to latest versions
- Change some of default settings

## 1.2.1

- 1.83.1 VsCode Extension API

## 1.2.0

- Update Dependencies to latest versions

## 1.1.0

- Update Dependencies to latest versions

## 1.0.0

- Initial release and fixes.
