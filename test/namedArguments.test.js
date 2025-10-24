const { describe, it } = require('mocha');
const { expect } = require('chai');
const Parser = require('../src/parser');

describe('Parser - Named Arguments', () => {
  const parser = new Parser(true);

  it('should correctly identify named arguments', () => {
    const text = `<?php
    greet(name: "Jane", greeting: "Hey", times: 3);
    greet(greeting: "Howdy", name: "Bob", times: 1);
  `;
    parser.parse(text);
    const { functionGroups } = parser;

    expect(functionGroups).to.have.lengthOf(2);
    
    // First call: greet(name: "Jane", greeting: "Hey", times: 3)
    const firstCall = functionGroups[0];
    expect(firstCall.args).to.have.lengthOf(3);
    expect(firstCall.args[0].namedParam).to.equal('name');
    expect(firstCall.args[1].namedParam).to.equal('greeting');
    expect(firstCall.args[2].namedParam).to.equal('times');

    // Second call: greet(greeting: "Howdy", name: "Bob", times: 1)
    const secondCall = functionGroups[1];
    expect(secondCall.args).to.have.lengthOf(3);
    expect(secondCall.args[0].namedParam).to.equal('greeting');
    expect(secondCall.args[1].namedParam).to.equal('name');
    expect(secondCall.args[2].namedParam).to.equal('times');
  });

  it('should handle mixed positional and non-named arguments', () => {
    const text = `<?php
    join(', ', [1, 2, 3]);
  `;
    parser.parse(text);
    const { functionGroups } = parser;

    expect(functionGroups).to.have.lengthOf(1);
    const call = functionGroups[0];
    expect(call.args).to.have.lengthOf(2);
    expect(call.args[0].namedParam).to.be.null;
    expect(call.args[1].namedParam).to.be.null;
  });
});
