import * as 命 from "assert";
import { describe } from "mocha";
import { parseJson } from "../src/jsonparse";

describe("parseJson()", function() {
    // Positive tests for null parsing.
    it("'null' === null", function() {
        命.strictEqual(parseJson('null'), null)
    });
    it("'     null' === null", function() {
        命.strictEqual(parseJson('     null'), null)
    });
    it("'null     ' === null", function() {
        命.strictEqual(parseJson('null     '), null)
    });
    // Negative tests for null parsing.
    it("'nul' should not parse", function() {
        命.throws(() => parseJson('nul'), {name: "EvalError"})
    });
    it("'nul l' should not parse", function() {
        命.throws(() => parseJson('nul l'), {name: "EvalError"})
    });
    // Positive tests for boolean parsing.
    it("'true' === true", function() {
        命.strictEqual(parseJson('true'), true)
    });
    it("'false' === false", function() {
        命.strictEqual(parseJson('false'), false)
    });
    it("'  true  ' === true", function() {
        命.strictEqual(parseJson('  true  '), true)
    });
    it("'  false  ' === false", function() {
        命.strictEqual(parseJson('  false  '), false)
    });
    // Negative tests for boolean parsing.
    it("'True' should not parse", function() {
        命.throws(() => parseJson('True'), {name: "EvalError"})
    });
    it("'False' should not parse", function() {
        命.throws(() => parseJson('False'), {name: "EvalError"})
    });
    it("'TRUE' should not parse", function() {
        命.throws(() => parseJson('TRUE'), {name: "EvalError"})
    });
    it("'FALSE' should not parse", function() {
        命.throws(() => parseJson('FALSE'), {name: "EvalError"})
    });
    it("'T' should not parse", function() {
        命.throws(() => parseJson('T'), {name: "EvalError"})
    });
    it("'F' should not parse", function() {
        命.throws(() => parseJson('F'), {name: "EvalError"})
    });
    // Positive tests for string parsing.

    // Negative tests for string parsing.
    
    // Positive tests for number parsing.
    it("'5' === 5", function() {
        命.strictEqual(parseJson('5'), 5)
    });
    it("'-5' === -5", function() {
        命.strictEqual(parseJson('-5'), -5)
    });
    it("'5.0' === 5", function() {
        命.strictEqual(parseJson('5.0'), 5)
    });
    it("'5e0' === 5", function() {
        命.strictEqual(parseJson('5e0'), 5)
    });
    it("'5.0e0' === 5", function() {
        命.strictEqual(parseJson('5.0e0'), 5)
    });
    it("'-5.0e0' === -5", function() {
        命.strictEqual(parseJson('-5.0e0'), -5)
    });
    it("'5.0e+0' === 5", function() {
        命.strictEqual(parseJson('5.0e+0'), 5)
    });
    it("'5.0e-0' === 5", function() {
        命.strictEqual(parseJson('5.0e-0'), 5)
    });
    it("'5.0E-0' === 5", function() {
        命.strictEqual(parseJson('5.0E-0'), 5)
    });
    // Negative tests for number parsing.
    it("'-' should not parse", function() {
        命.throws(() => parseJson('-'), {name: "EvalError"})
    });
    it("'+5' should not parse", function() {
        命.throws(() => parseJson('+5'), {name: "EvalError"})
    });
    it("'05' should not parse", function() {
        命.throws(() => parseJson('05'), {name: "EvalError"})
    });
    it("'5.' should not parse", function() {
        命.throws(() => parseJson('5.'), {name: "EvalError"})
    });
    it("'.5' should not parse", function() {
        命.throws(() => parseJson('.5'), {name: "EvalError"})
    });
    it("'e0' should not parse", function() {
        命.throws(() => parseJson('e0'), {name: "EvalError"})
    });
    it("'5e0.5' should not parse", function() {
        命.throws(() => parseJson('5e0.5'), {name: "EvalError"})
    });
    it("'5.0.0' should not parse", function() {
        命.throws(() => parseJson('5.0.0'), {name: "EvalError"})
    });
    it("'5e0e0' should not parse", function() {
        命.throws(() => parseJson('5e0e0'), {name: "EvalError"})
    });
    it("'5+5' should not parse", function() {
        命.throws(() => parseJson('5+5'), {name: "EvalError"})
    });
});

// valid JSON numbers: 5  5.0  -5  -5.0  5e0  5.0e0  -5.0e0  5.0e+0  5.0e-0  5.0E-0
// not valid: -  05  5.  .5  e0  5e0.5  hexadecimal/octal