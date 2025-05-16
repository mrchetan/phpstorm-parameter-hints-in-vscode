const { Position, Range } = require('vscode');

/* eslint-disable no-param-reassign */
const literals = [
  'boolean',
  'number',
  'string',
  'magic',
  'nowdoc',
  'array',
  'null',
  'encapsed',
  'nullkeyword'
];

// Keep only arguments that are literals
const onlyLiterals = (functionGroups, shouldApply) => {
  if (!shouldApply) {
    return functionGroups;
  }

  return functionGroups.filter(functionGroup => {
    functionGroup.args = functionGroup.args.filter(arg => literals.includes(arg.kind));

    return functionGroup.args.length > 0;
  });
};

// Keep only arguments in current line/selection
const onlySelection = (functionGroups, activeEditor, shouldApply) => {
  if (!shouldApply) {
    return functionGroups;
  }

  const currentSelection = activeEditor.selection;
  let callback;

  if (currentSelection) {
    const selectedLines = new Set();

    // Include all selections
    activeEditor.selections.forEach(selection => {
      for (let line = selection.start.line; line <= selection.end.line; line++) {
        selectedLines.add(line);
      }
    });

    callback = argument => selectedLines.has(argument.start.line);

    return functionGroups.filter(functionGroup => {
      functionGroup.args = functionGroup.args.filter(callback);

      return functionGroup.args.length > 0;
    });
  }

  return functionGroups;
};

const onlyVisibleRanges = (functionGroups, activeEditor, shouldApply) => {
  if (!shouldApply) {
    return functionGroups;
  }

  return functionGroups.filter(functionGroup => {
    functionGroup.args = functionGroup.args.filter(arg => {
      const { visibleRanges } = activeEditor;

      for (const range of visibleRanges) {
        const argRange = new Range(
          new Position(arg.start.line, arg.start.character),
          new Position(arg.end.line, arg.end.character)
        );

        if (range.contains(argRange)) {
          return true;
        }
      }

      return false;
    });

    return functionGroup.args.length > 0;
  });
};

module.exports = { onlyLiterals, onlySelection, onlyVisibleRanges };
