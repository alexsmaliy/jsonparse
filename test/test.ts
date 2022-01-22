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
    it("'True' should not parse (only true/false are valid boolean values)", function() {
        命.throws(() => parseJson('True'), {name: "EvalError"})
    });
    it("'False' should not parse (only true/false are valid boolean values)", function() {
        命.throws(() => parseJson('False'), {name: "EvalError"})
    });
    it("'TRUE' should not parse (only true/false are valid boolean values)", function() {
        命.throws(() => parseJson('TRUE'), {name: "EvalError"})
    });
    it("'FALSE' should not parse (only true/false are valid boolean values)", function() {
        命.throws(() => parseJson('FALSE'), {name: "EvalError"})
    });
    it("'T' should not parse (only true/false are valid boolean values)", function() {
        命.throws(() => parseJson('T'), {name: "EvalError"})
    });
    it("'F' should not parse (only true/false are valid boolean values)", function() {
        命.throws(() => parseJson('F'), {name: "EvalError"})
    });
    // Positive tests for string parsing.
    it("'\"abc\"' === \"abc\"", function() {
        命.strictEqual(parseJson('"abc"'), "abc")
    });
    it("'   \"abc\"   ' === \"abc\"", function() {
        命.strictEqual(parseJson('   "abc"   '), "abc")
    });
    it("'\"   abc   \"' === \"   abc   \"", function() {
        命.strictEqual(parseJson('"   abc   "'), "   abc   ")
    });
    it("'\"aa\\tbb\"' === \"aa\tbb\"", function() {
        命.strictEqual(parseJson('"aa\\tbb"'), "aa\tbb")
    });
    it("'\"aa\\rbb\"' === \"aa\rbb\"", function() {
        命.strictEqual(parseJson('"aa\\rbb"'), "aa\rbb")
    });
    it("'\"aa\\nbb\"' === \"aa\nbb\"", function() {
        命.strictEqual(parseJson('"aa\\nbb"'), "aa\nbb")
    });
    it("'\"aa\\\\bb\"' === \"aa\\bb\"", function() {
        命.strictEqual(parseJson('"aa\\\\bb"'), "aa\\bb")
    });
    it("'\"aa\\\"bb\"' === \"aa\"bb\"", function() {
        命.strictEqual(parseJson('"aa\\\"bb"'), "aa\"bb")
    });
    it("'  \" \\\\ a \\t b \\r c \\n d \\\" \"  ' === \" \\ a \t b \r c \n d \" \"", function() {
        命.strictEqual(parseJson('  " \\\\ a \\t b \\r c \\n d \\\" "  '), " \\ a \t b \r c \n d \" ")
    });
    // Negative tests for string parsing.
    it("'\"a \\z b\"' should not parse (invalid control sequence)", function() {
        命.throws(() => parseJson('\"a \\z b\"'), {name: "EvalError"})
    });
    it("'\"a \r b\"' should not parse (unescaped \\r disallowed)", function() {
        命.throws(() => parseJson('\"a \r b\"'), {name: "EvalError"})
    });
    it("'\"a \n b\"' should not parse (unescaped \\n disallowed)", function() {
        命.throws(() => parseJson('\"a \n b\"'), {name: "EvalError"})
    });
    it("'\"a \t b\"' should not parse (unescaped \\t disallowed)", function() {
        命.throws(() => parseJson('\"a \t b\"'), {name: "EvalError"})
    });
    it("'\"\\\"' should not parse (unescaped backslash eats closing double quote)", function() {
        命.throws(() => parseJson('\"\\\"'), {name: "EvalError"})
    });
    it("'\"\\ \"' should not parse (unescaped backslash looks like unsupported control sequence)", function() {
        命.throws(() => parseJson('\"\\ \"'), {name: "EvalError"})
    });
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
    it("'-' should not parse (no signs alone)", function() {
        命.throws(() => parseJson('-'), {name: "EvalError"})
    });
    it("'+5' should not parse (no explicit leading plus)", function() {
        命.throws(() => parseJson('+5'), {name: "EvalError"})
    });
    it("'05' should not parse (no leading zeros)", function() {
        命.throws(() => parseJson('05'), {name: "EvalError"})
    });
    it("'5.' should not parse (no trailing decimal point)", function() {
        命.throws(() => parseJson('5.'), {name: "EvalError"})
    });
    it("'.5' should not parse (no bare decimal point)", function() {
        命.throws(() => parseJson('.5'), {name: "EvalError"})
    });
    it("'e0' should not parse (exponent must have preceding number)", function() {
        命.throws(() => parseJson('e0'), {name: "EvalError"})
    });
    it("'5e0.5' should not parse (invalid exponent power)", function() {
        命.throws(() => parseJson('5e0.5'), {name: "EvalError"})
    });
    it("'5.0.0' should not parse (multiple decimal points)", function() {
        命.throws(() => parseJson('5.0.0'), {name: "EvalError"})
    });
    it("'5e0e0' should not parse (multiple exponents)", function() {
        命.throws(() => parseJson('5e0e0'), {name: "EvalError"})
    });
    it("'5+5' should not parse (invalid position of sign)", function() {
        命.throws(() => parseJson('5+5'), {name: "EvalError"})
    });
});
