# Migration Guide for v2.2.0+

## Color Customization Changes

As of v2.2.0, the extension uses VS Code's native Inlay Hints API instead of custom text decorations. This provides better integration with VS Code features like word wrap, but means custom color settings have changed.

### ❌ Old (Deprecated - No longer works)

```json
{
  "colors": {
    "phpParameterHint.hintForeground": "#8D9BD6",
    "phpParameterHint.hintBackground": "#292D3E"
  }
}
```

### ✅ New (Use this instead)

```json
{
  "workbench.colorCustomizations": {
    "editorInlayHint.foreground": "#8D9BD6",
    "editorInlayHint.background": "#292D3E",
    "editorInlayHint.parameterForeground": "#8D9BD6",
    "editorInlayHint.parameterBackground": "#292D3E"
  }
}
```

**Note:** The `editorInlayHint.*` settings affect ALL inlay hints in VS Code, not just PHP parameter hints. If you want to customize only parameter hints, use the `editorInlayHint.parameter*` variants.

## Styling Settings Changes

The following settings are deprecated and no longer functional:

- `phpParameterHint.opacity`
- `phpParameterHint.borderRadius`
- `phpParameterHint.fontWeight` → Use `editor.inlayHints.fontWeight` instead
- `phpParameterHint.fontStyle`
- `phpParameterHint.margin`
- `phpParameterHint.verticalPadding`
- `phpParameterHint.horizontalPadding`
- `phpParameterHint.fontSize` → Use `editor.inlayHints.fontSize` instead

### Recommended VS Code Settings for Inlay Hints

```json
{
  "editor.inlayHints.enabled": "on",
  "editor.inlayHints.fontSize": 12,
  "editor.inlayHints.fontFamily": "monospace",
  "editor.inlayHints.padding": true,
  "workbench.colorCustomizations": {
    "editorInlayHint.foreground": "#8D9BD6",
    "editorInlayHint.background": "#292D3E80"
  }
}
```

## What Still Works

All functional settings continue to work:

- `phpParameterHint.enabled`
- `phpParameterHint.onSave`
- `phpParameterHint.onChange`
- `phpParameterHint.collapseHintsWhenEqual`
- `phpParameterHint.collapseTypeWhenEqual`
- `phpParameterHint.showFullType`
- `phpParameterHint.hintOnlyLiterals`
- `phpParameterHint.hintTypeName`
- `phpParameterHint.hintOnlyLine`
- `phpParameterHint.hintOnlyVisibleRanges`
- `phpParameterHint.showDollarSign`
- All toggle commands continue to work
