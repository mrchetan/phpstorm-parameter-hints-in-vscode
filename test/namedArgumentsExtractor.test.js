const vscode = require('vscode');
const path = require('path');
const { describe, it, after, before } = require('mocha');
const { expect } = require('chai');
const { FunctionGroupsFacade } = require('../src/functionGroupsFacade');
const { CacheService } = require('../src/cache');
const getHints = require('../src/parameterExtractor');
const { sleep, examplesFolderPath } = require('./utils');

describe('parameterExtractor - Named Arguments', () => {
  describe('getHints with named arguments', () => {
    let functionGroupsLen;
    let functionDictionary;
    let expectedHints;
    const { Range, Position } = vscode;
    let editor;
    let functionGroups;

    before(async () => {
      const functionGroupsFacade = new FunctionGroupsFacade(new CacheService());
      const uri = vscode.Uri.file(path.join(`${examplesFolderPath}namedArguments.php`));
      const document = await vscode.workspace.openTextDocument(uri);
      editor = await vscode.window.showTextDocument(document);
      await sleep(500); // wait for file to fully load
      functionGroups = await functionGroupsFacade.get(
        editor.document.uri.toString(),
        editor.document.getText()
      );
      functionGroupsLen = functionGroups.length;
      functionDictionary = new Map();

      // Expected hints for the named arguments example
      // Line 10: greet("John", "Hi", 2) - positional arguments (should show hints)
      // Line 13: greet(name: "Jane", greeting: "Hey", times: 3) - named in order (no hints)
      // Line 16: greet(greeting: "Howdy", name: "Bob", times: 1) - named different order (no hints)
      // Line 19: greet(name: "Alice", times: 2, greeting: "Greetings") - named mixed order (no hints)
      // Line 22: greet(name: "Charlie") - only some named (no hints)
      // Line 25: greet("Dave", greeting: "Aloha") - mixed positional and named (show hints for positional only)
      expectedHints = [
        // Traditional positional - greet("John", "Hi", 2) - should show hints
        [
          {
            text: 'name:',
            range: new Range(new Position(9, 6), new Position(9, 12))
          },
          {
            text: 'greeting:',
            range: new Range(new Position(9, 14), new Position(9, 18))
          },
          {
            text: 'times:',
            range: new Range(new Position(9, 20), new Position(9, 21))
          }
        ],
        // Named in order - no hints since names are already explicit
        [],
        // Named different order - no hints since names are already explicit
        [],
        // Named mixed order - no hints since names are already explicit
        [],
        // Only some named - no hints since names are already explicit
        [],
        // Mixed positional and named - show hints for positional only
        [
          {
            text: 'name:',
            range: new Range(new Position(24, 6), new Position(24, 12))
          }
        ]
      ];
    });

    after(async () => {
      await vscode.workspace.getConfiguration('phpParameterHint').update('hintTypeName', 0, true);
      await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
      await sleep(500);
    });

    it('should return correct hints for positional arguments', async () => {
      await vscode.workspace.getConfiguration('phpParameterHint').update('hintTypeName', 0, true);
      const hints = [];

      for (let index = 0; index < functionGroupsLen; index += 1) {
        const functionGroup = functionGroups[index];
        try {
          hints.push(await getHints(functionDictionary, functionGroup, editor));
          // eslint-disable-next-line no-unused-vars
        } catch (err) {}
      }

      expect(hints).to.have.lengthOf(6);
      expect(hints[0]).to.have.lengthOf(3);

      // Verify positional arguments work as before
      expect(hints[0][0].text).to.equal(expectedHints[0][0].text);
      expect(hints[0][1].text).to.equal(expectedHints[0][1].text);
      expect(hints[0][2].text).to.equal(expectedHints[0][2].text);
    });

    it('should not show hints for named arguments in order', async () => {
      await vscode.workspace.getConfiguration('phpParameterHint').update('hintTypeName', 0, true);
      const hints = [];

      for (let index = 0; index < functionGroupsLen; index += 1) {
        const functionGroup = functionGroups[index];
        try {
          hints.push(await getHints(functionDictionary, functionGroup, editor));
          // eslint-disable-next-line no-unused-vars
        } catch (err) {}
      }

      expect(hints).to.have.lengthOf(6);
      
      // Named arguments should not show hints since parameter names are already explicit
      expect(hints[1]).to.have.lengthOf(0);
    });

    it('should not show hints for named arguments in different order', async () => {
      await vscode.workspace.getConfiguration('phpParameterHint').update('hintTypeName', 0, true);
      const hints = [];

      for (let index = 0; index < functionGroupsLen; index += 1) {
        const functionGroup = functionGroups[index];
        try {
          hints.push(await getHints(functionDictionary, functionGroup, editor));
          // eslint-disable-next-line no-unused-vars
        } catch (err) {}
      }

      expect(hints).to.have.lengthOf(6);
      // Named arguments should not show hints since parameter names are already explicit
      expect(hints[2]).to.have.lengthOf(0);
    });

    it('should not show hints for named arguments in mixed order', async () => {
      await vscode.workspace.getConfiguration('phpParameterHint').update('hintTypeName', 0, true);
      const hints = [];

      for (let index = 0; index < functionGroupsLen; index += 1) {
        const functionGroup = functionGroups[index];
        try {
          hints.push(await getHints(functionDictionary, functionGroup, editor));
          // eslint-disable-next-line no-unused-vars
        } catch (err) {}
      }

      expect(hints).to.have.lengthOf(6);
      
      // Named arguments should not show hints since parameter names are already explicit
      expect(hints[3]).to.have.lengthOf(0);
    });

    it('should not show hints when only some arguments are named', async () => {
      await vscode.workspace.getConfiguration('phpParameterHint').update('hintTypeName', 0, true);
      const hints = [];

      for (let index = 0; index < functionGroupsLen; index += 1) {
        const functionGroup = functionGroups[index];
        try {
          hints.push(await getHints(functionDictionary, functionGroup, editor));
          // eslint-disable-next-line no-unused-vars
        } catch (err) {}
      }

      expect(hints).to.have.lengthOf(6);
      
      // Named arguments should not show hints since parameter names are already explicit
      expect(hints[4]).to.have.lengthOf(0);
    });

    it('should show hints only for positional arguments in mixed calls', async () => {
      await vscode.workspace.getConfiguration('phpParameterHint').update('hintTypeName', 0, true);
      const hints = [];

      for (let index = 0; index < functionGroupsLen; index += 1) {
        const functionGroup = functionGroups[index];
        try {
          hints.push(await getHints(functionDictionary, functionGroup, editor));
          // eslint-disable-next-line no-unused-vars
        } catch (err) {}
      }

      expect(hints).to.have.lengthOf(6);
      
      // Mixed positional and named: show hints only for positional arguments
      expect(hints[5]).to.have.lengthOf(1);
      expect(hints[5][0].text).to.equal('name:');
    });
  });
});
