# Change Log

## [2.1.0]
- Update Extension engine
- **BREAKING**: Migrated to VS Code's native Inlay Hints API for better word wrap support
- Fixes issue where parameter hints would break word wrap functionality
- Parameter hints now respect word wrap and integrate seamlessly with the editor
- **DEPRECATED**: Custom styling options (opacity, fontSize, fontWeight, etc.) are now deprecated
  - Styling is now controlled by VS Code's theme system via `editorInlayHint.*` settings
- **DEPRECATED**: Custom color settings (`phpParameterHint.hintForeground/Background`) are deprecated
  - Use VS Code's standard `editorInlayHint.foreground/background` theme colors instead
- All existing functionality (toggle commands, filtering options, etc.) continues to work

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
