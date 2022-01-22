import * as 命 from "assert";
import { describe, it } from "mocha";
import { parseJson } from "../src/jsonparse";

describe("parseJson()", function() {
    /*
        Positive tests for null parsing.
    */
    it("'null' === null", function() {
        命.strictEqual(parseJson('null'), null)
    });
    it("'     null' === null", function() {
        命.strictEqual(parseJson('     null'), null)
    });
    it("'null     ' === null", function() {
        命.strictEqual(parseJson('null     '), null)
    });

    /*
        Negative tests for null parsing.
    */
    it("'nul' should not parse", function() {
        命.throws(() => parseJson('nul'), {name: "EvalError"})
    });
    it("'nul l' should not parse", function() {
        命.throws(() => parseJson('nul l'), {name: "EvalError"})
    });

    /*
        Positive tests for boolean parsing.
    */
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

    /*
        Negative tests for boolean parsing.
    */
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

    /*
        Positive tests for string parsing.
    */
    it("'\"\"' === \"\"", function() {
        命.strictEqual(parseJson('""'), "")
    });
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

    /*
        Negative tests for string parsing.
    */
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

    /*
        Positive tests for number parsing.
    */
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

    /*
        Negative tests for number parsing.
    */
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

    /*
        Positive tests for array parsing.
    */
    it("'[]' === []", function() {
        命.deepStrictEqual(parseJson('[]'), [])
    });
    it("'   []   ' === []", function() {
        命.deepStrictEqual(parseJson('   []   '), [])
    });
    it("'[1]' === [1]", function() {
        命.deepStrictEqual(parseJson('[1]'), [1])
    });
    it("'[1, 2, 3]' === [1, 2, 3]", function() {
        命.deepStrictEqual(parseJson('[1, 2, 3]'), [1, 2, 3])
    });
    it("'[1 ,2 ,3]' === [1, 2, 3]", function() {
        命.deepStrictEqual(parseJson('[1 ,2 ,3]'), [1, 2, 3])
    });
    it("'[  1  ,  2  ,  3  ]' === [1, 2, 3]", function() {
        命.deepStrictEqual(parseJson('[  1  ,  2  ,  3  ]'), [1, 2, 3])
    });
    it("'[1 , \"abc\", true, null, [\"nested\", 5]]' === [1, \"abc\", true, null, [\"nested\", 5]]", function() {
        命.deepStrictEqual(parseJson('[1 , \"abc\", true, null, [\"nested\", 5]]'), [1, "abc", true, null, ["nested", 5]])
    });
    it("'[\"this string contains ]\"]' === [\"this string contains ]\"]", function() {
        命.deepStrictEqual(parseJson('[\"this string contains ]\"]'), ["this string contains ]"])
    });
    it("'[[], [], [], [[[]]]]' === [[], [], [], [[[]]]]", function() {
        命.deepStrictEqual(parseJson('[[], [], [], [[[]]]]'), [[], [], [], [[[]]]])
    });

    /*
        Negative tests for array parsing.
    */
    it("'[abc]' should not parse (contains invalid element)", function() {
        命.throws(() => parseJson('[abc]'), {name: "EvalError"})
    });
    it("'[5,]' should not parse (trailing comma)", function() {
        命.throws(() => parseJson('[5,]'), {name: "EvalError"})
    });
    it("'[,5]' should not parse (leading comma)", function() {
        命.throws(() => parseJson('[,5]'), {name: "EvalError"})
    });
    it("'[ , ]' should not parse (only comma, no valid children)", function() {
        命.throws(() => parseJson('[ , ]'), {name: "EvalError"})
    });
    it("'[ ]]' should not parse (not well-formed array)", function() {
        命.throws(() => parseJson('[ ]]'), {name: "EvalError"})
    });
    it("'[[ ]' should not parse (not well-formed array)", function() {
        命.throws(() => parseJson('[[ ]'), {name: "EvalError"})
    });
    it("'[ 123, \"abc\", ' should not parse (array not closed)", function() {
        命.throws(() => parseJson('[ 123, "abc", '), {name: "EvalError"})
    });
    it("'123]' should not parse (not well-formed array)", function() {
        命.throws(() => parseJson('123]'), {name: "EvalError"})
    });

    /*
        Positive tests for object literal parsing.
    */
    it("'{}' === {}", function() {
        命.deepStrictEqual(parseJson('{}'), {})
    });
    
    it("'   {   }   ' === {}", function() {
        命.deepStrictEqual(parseJson('   {   }   '), {})
    });

    it("'{\"a\": 5}' === {\"a\": 5}", function() {
        命.deepStrictEqual(parseJson('{\"a\": 5}'), {"a": 5})
    });

    it("'{  \"a\"  :null  }' === {\"a\": null}", function() {
        命.deepStrictEqual(parseJson('{  \"a\"  :null  }'), {"a": null})
    });

    it("'{\"a\": 5, \"bc\": 10, \"def ghi\": 15}' === {\"a\": 5, \"bc\": 10, \"def  ghi\": 15}", function() {
        命.deepStrictEqual(parseJson('{\"a\": 5, \"bc\": 10, \"def ghi\": 15}'), {"a": 5, "bc": 10, "def ghi": 15})
    });

    it("'{ \"a\": { \"b\": { \"c\": null}}}' === {\"a\": {\"b\": {\"c\": null}}}", function() {
        命.deepStrictEqual(parseJson('{ \"a\": { \"b\": { \"c\": null}}}'), {"a": {"b": {"c": null}}})
    });

    it("'{\"a\": [\"b\", false, 5, {\"c\": \"moo\"}]}' === {\"a\": [\"b\", false, 5, {\"c\": \"moo\"}]}", function() {
        命.deepStrictEqual(parseJson('{\"a\": [\"b\", false, 5, {\"c\": \"moo\"}]}'), {"a": ["b", false, 5, {"c": "moo"}]})
    });

    /*
        Negative tests for object literal parsing.
    */
    it("'{,}' should not parse (only comma)", function() {
        命.throws(() => parseJson('{,}'), {name: "EvalError"})
    });

    it("'{:}' should not parse (only colon)", function() {
        命.throws(() => parseJson('{:}'), {name: "EvalError"})
    });

    it("'{\"a\"}' should not parse (only key)", function() {
        命.throws(() => parseJson('{\"a\"}'), {name: "EvalError"})
    });

    it("'{5: \"a\"}' should not parse (key must be string)", function() {
        命.throws(() => parseJson('{5: \"a\"}'), {name: "EvalError"})
    });

    it("'{ : \"a\"}' should not parse (only value)", function() {
        命.throws(() => parseJson('{ : \"a\"}'), {name: "EvalError"})
    });

    it("'{[1, 2, 3]}' should not parse (only key, but different)", function() {
        命.throws(() => parseJson('{[1, 2, 3]}'), {name: "EvalError"})
    });

    it("'{\"a\": { }' should not parse (object literal not closed)", function() {
        命.throws(() => parseJson('{\"a\": { }'), {name: "EvalError"})
    });

    it("'\"a\": 5}' should not parse (object literal not properly opened)", function() {
        命.throws(() => parseJson('\"a\": 5}'), {name: "EvalError"})
    });

    it("'{\"a\": 5, \"b\": 10,}' should not parse (trailing comma)", function() {
        命.throws(() => parseJson('{\"a\": 5, \"b\": 10,}'), {name: "EvalError"})
    });

    it("'{  , \"a\": 5, \"b\": 10}' should not parse (leading comma)", function() {
        命.throws(() => parseJson('{  , \"a\": 5, \"b\": 10}'), {name: "EvalError"})
    });
});
