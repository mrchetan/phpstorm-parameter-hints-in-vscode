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
      // Line 10: greet("John", "Hi", 2) - positional arguments
      // Line 13: greet(name: "Jane", greeting: "Hey", times: 3) - named in order
      // Line 16: greet(greeting: "Howdy", name: "Bob", times: 1) - named different order
      // Line 19: greet(name: "Alice", times: 2, greeting: "Greetings") - named mixed order
      // Line 22: greet(name: "Charlie") - only some named
      expectedHints = [
        // Traditional positional - greet("John", "Hi", 2)
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
        // Named in order - greet(name: "Jane", greeting: "Hey", times: 3)
        [
          {
            text: 'name:',
            range: new Range(new Position(12, 12), new Position(12, 18))
          },
          {
            text: 'greeting:',
            range: new Range(new Position(12, 30), new Position(12, 35))
          },
          {
            text: 'times:',
            range: new Range(new Position(12, 44), new Position(12, 45))
          }
        ],
        // Named different order - greet(greeting: "Howdy", name: "Bob", times: 1)
        [
          {
            text: 'greeting:',
            range: new Range(new Position(15, 16), new Position(15, 23))
          },
          {
            text: 'name:',
            range: new Range(new Position(15, 31), new Position(15, 36))
          },
          {
            text: 'times:',
            range: new Range(new Position(15, 45), new Position(15, 46))
          }
        ],
        // Named mixed order - greet(name: "Alice", times: 2, greeting: "Greetings")
        [
          {
            text: 'name:',
            range: new Range(new Position(18, 12), new Position(18, 19))
          },
          {
            text: 'times:',
            range: new Range(new Position(18, 28), new Position(18, 29))
          },
          {
            text: 'greeting:',
            range: new Range(new Position(18, 41), new Position(18, 52))
          }
        ],
        // Only some named - greet(name: "Charlie")
        [
          {
            text: 'name:',
            range: new Range(new Position(21, 12), new Position(21, 21))
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

      expect(hints).to.have.lengthOf(5);
      expect(hints[0]).to.have.lengthOf(3);

      // Verify positional arguments work as before
      expect(hints[0][0].text).to.equal(expectedHints[0][0].text);
      expect(hints[0][1].text).to.equal(expectedHints[0][1].text);
      expect(hints[0][2].text).to.equal(expectedHints[0][2].text);
    });

    it('should return correct hints for named arguments in order', async () => {
      await vscode.workspace.getConfiguration('phpParameterHint').update('hintTypeName', 0, true);
      const hints = [];

      for (let index = 0; index < functionGroupsLen; index += 1) {
        const functionGroup = functionGroups[index];
        try {
          hints.push(await getHints(functionDictionary, functionGroup, editor));
          // eslint-disable-next-line no-unused-vars
        } catch (err) {}
      }

      expect(hints).to.have.lengthOf(5);
      expect(hints[1]).to.have.lengthOf(3);

      // Verify named arguments in order
      expect(hints[1][0].text).to.equal('name:');
      expect(hints[1][1].text).to.equal('greeting:');
      expect(hints[1][2].text).to.equal('times:');
    });

    it('should return correct hints for named arguments in different order', async () => {
      await vscode.workspace.getConfiguration('phpParameterHint').update('hintTypeName', 0, true);
      const hints = [];

      for (let index = 0; index < functionGroupsLen; index += 1) {
        const functionGroup = functionGroups[index];
        try {
          hints.push(await getHints(functionDictionary, functionGroup, editor));
          // eslint-disable-next-line no-unused-vars
        } catch (err) {}
      }

      expect(hints).to.have.lengthOf(5);
      expect(hints[2]).to.have.lengthOf(3);

      // Verify named arguments match correctly even in different order
      // The hint for the first argument (greeting: "Howdy") should still show 'greeting:'
      expect(hints[2][0].text).to.equal('greeting:');
      // The hint for the second argument (name: "Bob") should show 'name:'
      expect(hints[2][1].text).to.equal('name:');
      // The hint for the third argument (times: 1) should show 'times:'
      expect(hints[2][2].text).to.equal('times:');
    });

    it('should return correct hints for named arguments in mixed order', async () => {
      await vscode.workspace.getConfiguration('phpParameterHint').update('hintTypeName', 0, true);
      const hints = [];

      for (let index = 0; index < functionGroupsLen; index += 1) {
        const functionGroup = functionGroups[index];
        try {
          hints.push(await getHints(functionDictionary, functionGroup, editor));
          // eslint-disable-next-line no-unused-vars
        } catch (err) {}
      }

      expect(hints).to.have.lengthOf(5);
      expect(hints[3]).to.have.lengthOf(3);

      // Verify mixed order: name, times, greeting
      expect(hints[3][0].text).to.equal('name:');
      expect(hints[3][1].text).to.equal('times:');
      expect(hints[3][2].text).to.equal('greeting:');
    });

    it('should return correct hints when only some arguments are named', async () => {
      await vscode.workspace.getConfiguration('phpParameterHint').update('hintTypeName', 0, true);
      const hints = [];

      for (let index = 0; index < functionGroupsLen; index += 1) {
        const functionGroup = functionGroups[index];
        try {
          hints.push(await getHints(functionDictionary, functionGroup, editor));
          // eslint-disable-next-line no-unused-vars
        } catch (err) {}
      }

      expect(hints).to.have.lengthOf(5);
      expect(hints[4]).to.have.lengthOf(1);

      // Only name is provided
      expect(hints[4][0].text).to.equal('name:');
    });
  });
});
