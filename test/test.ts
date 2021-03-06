import * as 命 from "assert";
import { describe, it } from "mocha";
import { dumpJson } from "../src/dumpjson";
import { parseJson } from "../src/jsonparse";

describe("dumpJson()", function() {
    /*
        Tests: some arbitrary ones, then HR positives, then HR negatives.
    */
    const testVals: Array<any> = ([
        null,
        true, false,
        new Date(),
        0, -0, +0, Infinity, -Infinity, 0/0, Infinity/0, -0.05E-5, 1E-300, 1E+300,
        "", "abc", "a\tb\rc\n", "\\", "\"", "'", "\"'\"'",
        [], [1, 2, 3], [null, true, undefined], [[[]]], [1, ["a", [new Date()]]],
        {}, {"a": null}, {"a": {"a": {"a": {}}}}, {"a": x => x}, {"a": undefined, "b": 5},
        /abc/g,
    ] as Array<any>).concat([
        9,
        null,
        true,
        false,
        'Hello world',
        [],
        [8],
        ['hi'],
        [8, 'hi'],
        [1, 0, -1, -0.3, 0.3, 1343.32, 3345, 0.00011999999999999999],
        [8, [[], 3, 4]],
        [[[['foo']]]],
        {},
        {'a': 'apple'},
        {'foo': true, 'bar': false, 'baz': null},
        {'boolean, true': true, 'boolean, false': false, 'null': null },
        // basic nesting
        {'a': {'b': 'c'}},
        {'a': ['b', 'c']},
        [{'a': 'b'}, {'c': 'd'}],
        {'a': [], 'c': {}, 'b': true}
      ]).concat([
        {
          'functions': function() {},
          'undefined': undefined
        },
        {'a': function() {}, 'b': undefined, 'c': true}
      ]);

    for (const testVal of testVals) {
        it(String(testVal), function() {
            const testValLocalRef = testVal;
            命.deepStrictEqual(dumpJson(testValLocalRef), JSON.stringify(testValLocalRef));
        })
    }

    it("Object.create(null)", function() {
        const val = Object.create(null);
        命.deepStrictEqual(dumpJson(val), JSON.stringify(val));
    });

    it("prototypes", function() {
        const a = {"foo": 5};
        const b = Object.create(a);
        b["bar"] = 10;
        b["baz"] = /abc/g;
        b["qux"] = x => x;
        命.deepStrictEqual(dumpJson(b), JSON.stringify(b));
    });
});

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
        命.throws(() => parseJson('nul'), {name: "SyntaxError"})
    });
    it("'nullll' should not parse", function() {
        命.throws(() => parseJson('nullll'), {name: "SyntaxError"})
    });
    it("'nul l' should not parse", function() {
        命.throws(() => parseJson('nul l'), {name: "SyntaxError"})
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
    it("'truetrue' should not parse", function() {
        命.throws(() => parseJson('True'), {name: "SyntaxError"})
    });
    it("'True' should not parse (only true/false are valid boolean values)", function() {
        命.throws(() => parseJson('True'), {name: "SyntaxError"})
    });
    it("'False' should not parse (only true/false are valid boolean values)", function() {
        命.throws(() => parseJson('False'), {name: "SyntaxError"})
    });
    it("'TRUE' should not parse (only true/false are valid boolean values)", function() {
        命.throws(() => parseJson('TRUE'), {name: "SyntaxError"})
    });
    it("'FALSE' should not parse (only true/false are valid boolean values)", function() {
        命.throws(() => parseJson('FALSE'), {name: "SyntaxError"})
    });
    it("'T' should not parse (only true/false are valid boolean values)", function() {
        命.throws(() => parseJson('T'), {name: "SyntaxError"})
    });
    it("'F' should not parse (only true/false are valid boolean values)", function() {
        命.throws(() => parseJson('F'), {name: "SyntaxError"})
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
        命.throws(() => parseJson('\"a \\z b\"'), {name: "SyntaxError"})
    });
    it("'\"a \r b\"' should not parse (unescaped \\r disallowed)", function() {
        命.throws(() => parseJson('\"a \r b\"'), {name: "SyntaxError"})
    });
    it("'\"a \n b\"' should not parse (unescaped \\n disallowed)", function() {
        命.throws(() => parseJson('\"a \n b\"'), {name: "SyntaxError"})
    });
    it("'\"a \t b\"' should not parse (unescaped \\t disallowed)", function() {
        命.throws(() => parseJson('\"a \t b\"'), {name: "SyntaxError"})
    });
    it("'\"\\\"' should not parse (unescaped backslash eats closing double quote)", function() {
        命.throws(() => parseJson('\"\\\"'), {name: "SyntaxError"})
    });
    it("'\"\\ \"' should not parse (unescaped backslash looks like unsupported control sequence)", function() {
        命.throws(() => parseJson('\"\\ \"'), {name: "SyntaxError"})
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
    it("'0.5' === 0.5", function() {
        命.strictEqual(parseJson('0.5'), 0.5)
    });
    it("'-0.5' === -0.5", function() {
        命.strictEqual(parseJson('-0.5'), -0.5)
    });
    it("'0.00011999999999999999' === 0.00011999999999999999", function() {
        命.strictEqual(parseJson('0.00011999999999999999'), 0.00011999999999999999)
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
        命.throws(() => parseJson('-'), {name: "SyntaxError"})
    });
    it("'+5' should not parse (no explicit leading plus)", function() {
        命.throws(() => parseJson('+5'), {name: "SyntaxError"})
    });
    it("'05' should not parse (no leading zeros)", function() {
        命.throws(() => parseJson('05'), {name: "SyntaxError"})
    });
    it("'5.' should not parse (no trailing decimal point)", function() {
        命.throws(() => parseJson('5.'), {name: "SyntaxError"})
    });
    it("'.5' should not parse (no bare decimal point)", function() {
        命.throws(() => parseJson('.5'), {name: "SyntaxError"})
    });
    it("'e0' should not parse (exponent must have preceding number)", function() {
        命.throws(() => parseJson('e0'), {name: "SyntaxError"})
    });
    it("'5e0.5' should not parse (invalid exponent power)", function() {
        命.throws(() => parseJson('5e0.5'), {name: "SyntaxError"})
    });
    it("'5.0.0' should not parse (multiple decimal points)", function() {
        命.throws(() => parseJson('5.0.0'), {name: "SyntaxError"})
    });
    it("'5e0e0' should not parse (multiple exponents)", function() {
        命.throws(() => parseJson('5e0e0'), {name: "SyntaxError"})
    });
    it("'5+5' should not parse (invalid position of sign)", function() {
        命.throws(() => parseJson('5+5'), {name: "SyntaxError"})
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
    it("'[0]' === [0]", function() {
        命.deepStrictEqual(parseJson('[0]'), [0])
    });
    it("'[-0]' === [-0]", function() {
        命.deepStrictEqual(parseJson('[-0]'), [-0])
    });
    it("'[true]' === [true]", function() {
        命.deepStrictEqual(parseJson('[true]'), [true])
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
        命.throws(() => parseJson('[abc]'), {name: "SyntaxError"})
    });
    it("'[truetrue]' should not parse (no separator between elements)", function() {
        命.throws(() => parseJson('[truetrue]'), {name: "SyntaxError"})
    });
    it("'[falsefalse]' should not parse (no separator between elements)", function() {
        命.throws(() => parseJson('[falsefalse]'), {name: "SyntaxError"})
    });
    it("'[nullnull]' should not parse (no separator between elements)", function() {
        命.throws(() => parseJson('[nullnull]'), {name: "SyntaxError"})
    });
    it("'[5,]' should not parse (trailing comma)", function() {
        命.throws(() => parseJson('[5,]'), {name: "SyntaxError"})
    });
    it("'[,5]' should not parse (leading comma)", function() {
        命.throws(() => parseJson('[,5]'), {name: "SyntaxError"})
    });
    it("'[ , ]' should not parse (only comma, no valid children)", function() {
        命.throws(() => parseJson('[ , ]'), {name: "SyntaxError"})
    });
    it("'[ ]]' should not parse (not well-formed array)", function() {
        命.throws(() => parseJson('[ ]]'), {name: "SyntaxError"})
    });
    it("'[[ ]' should not parse (not well-formed array)", function() {
        命.throws(() => parseJson('[[ ]'), {name: "SyntaxError"})
    });
    it("'[ 123, \"abc\", ' should not parse (array not closed)", function() {
        命.throws(() => parseJson('[ 123, "abc", '), {name: "SyntaxError"})
    });
    it("'123]' should not parse (not well-formed array)", function() {
        命.throws(() => parseJson('123]'), {name: "SyntaxError"})
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
        命.throws(() => parseJson('{,}'), {name: "SyntaxError"})
    });

    it("'{:}' should not parse (only colon)", function() {
        命.throws(() => parseJson('{:}'), {name: "SyntaxError"})
    });

    it("'{\"a\"}' should not parse (only key)", function() {
        命.throws(() => parseJson('{\"a\"}'), {name: "SyntaxError"})
    });

    it("'{\"a\": truetrue}' should not parse (only key)", function() {
        命.throws(() => parseJson('{\"a\": truetrue}'), {name: "SyntaxError"})
    });

    it("'{5: \"a\"}' should not parse (key must be string)", function() {
        命.throws(() => parseJson('{5: \"a\"}'), {name: "SyntaxError"})
    });

    it("'{ : \"a\"}' should not parse (only value)", function() {
        命.throws(() => parseJson('{ : \"a\"}'), {name: "SyntaxError"})
    });

    it("'{[1, 2, 3]}' should not parse (only key, but different)", function() {
        命.throws(() => parseJson('{[1, 2, 3]}'), {name: "SyntaxError"})
    });

    it("'{\"a\": { }' should not parse (object literal not closed)", function() {
        命.throws(() => parseJson('{\"a\": { }'), {name: "SyntaxError"})
    });

    it("'\"a\": 5}' should not parse (object literal not properly opened)", function() {
        命.throws(() => parseJson('\"a\": 5}'), {name: "SyntaxError"})
    });

    it("'{\"a\": 5, \"b\": 10,}' should not parse (trailing comma)", function() {
        命.throws(() => parseJson('{\"a\": 5, \"b\": 10,}'), {name: "SyntaxError"})
    });

    it("'{  , \"a\": 5, \"b\": 10}' should not parse (leading comma)", function() {
        命.throws(() => parseJson('{  , \"a\": 5, \"b\": 10}'), {name: "SyntaxError"})
    });

    /*
        HackReactor tests
    */
    const parseableStrings = [
        // basic stuff
        '[]',
        
        '{"foo": ""}',
        
        '{}',
        
        '{"foo": "bar"}',
        
        '["one", "two"]',
        
        '{"a": "b", "c": "d"}',
        
        '[null,false,true]',
        
        '{"foo": true, "bar": false, "baz": null}',
        
        '[1, 0, -1, -0.3, 0.3, 1343.32, 3345, 0.00011999999999999999]',
        
        '{"boolean, true": true, "boolean, false": false, "null": null }',
  
        // basic nesting
        '{"a":{"b":"c"}}',

        '{"a":["b", "c"]}',

        '[{"a":"b"}, {"c":"d"}]',

        '{"a":[],"c": {}, "b": true}',

        '[[[["foo"]]]]',
          
        // escaping
        '["\\\\\\"\\"a\\""]',

        '["and you can\'t escape thi\s"]',

        // everything all at once
        '{"CoreletAPIVersion":2,"CoreletType":"standalone",' +
        '"documentation":"A corelet that provides the capability to upload' +
        ' a folderâ€™s contents into a userâ€™s locker.","functions":[' +
        '{"documentation":"Displays a dialog box that allows user to ' +
        'select a folder on the local system.","name":' +
        '"ShowBrowseDialog","parameters":[{"documentation":"The ' +
        'callback function for results.","name":"callback","required":' +
        'true,"type":"callback"}]},{"documentation":"Uploads all mp3 files' +
        ' in the folder provided.","name":"UploadFolder","parameters":' +
        '[{"documentation":"The path to upload mp3 files from."' +
        ',"name":"path","required":true,"type":"string"},{"documentation":' +
        ' "The callback function for progress.","name":"callback",' +
        '"required":true,"type":"callback"}]},{"documentation":"Returns' +
        ' the server name to the current locker service.",' +
        '"name":"GetLockerService","parameters":[]},{"documentation":' +
        '"Changes the name of the locker service.","name":"SetLockerSer' +
        'vice","parameters":[{"documentation":"The value of the locker' +
        ' service to set active.","name":"LockerService","required":true' +
        ',"type":"string"}]},{"documentation":"Downloads locker files to' +
        ' the suggested folder.","name":"DownloadFile","parameters":[{"' +
        'documentation":"The origin path of the locker file.",' +
        '"name":"path","required":true,"type":"string"},{"documentation"' +
        ':"The Window destination path of the locker file.",' +
        '"name":"destination","required":true,"type":"integer"},{"docum' +
        'entation":"The callback function for progress.","name":' +
        '"callback","required":true,"type":"callback"}]}],' +
        '"name":"LockerUploader","version":{"major":0,' +
        '"micro":1,"minor":0},"versionString":"0.0.1"}',
        '{ "firstName": "John", "lastName" : "Smith", "age" : ' +
        '25, "address" : { "streetAddress": "21 2nd Street", ' +
        '"city" : "New York", "state" : "NY", "postalCode" : ' +
        ' "10021" }, "phoneNumber": [ { "type" : "home", ' +
        '"number": "212 555-1234" }, { "type" : "fax", ' +
        '"number": "646 555-4567" } ] }',

        '{\r\n' +
        '          "glossary": {\n' +
        '              "title": "example glossary",\n\r' +
        '      \t\t"GlossDiv": {\r\n' +
        '                  "title": "S",\r\n' +
        '      \t\t\t"GlossList": {\r\n' +
        '                      "GlossEntry": {\r\n' +
        '                          "ID": "SGML",\r\n' +
        '      \t\t\t\t\t"SortAs": "SGML",\r\n' +
        '      \t\t\t\t\t"GlossTerm": "Standard Generalized ' +
        'Markup Language",\r\n' +
        '      \t\t\t\t\t"Acronym": "SGML",\r\n' +
        '      \t\t\t\t\t"Abbrev": "ISO 8879:1986",\r\n' +
        '      \t\t\t\t\t"GlossDef": {\r\n' +
        '                              "para": "A meta-markup language,' +
        ' used to create markup languages such as DocBook.",\r\n' +
        '      \t\t\t\t\t\t"GlossSeeAlso": ["GML", "XML"]\r\n' +
        '                          },\r\n' +
        '      \t\t\t\t\t"GlossSee": "markup"\r\n' +
        '                      }\r\n' +
        '                  }\r\n' +
        '              }\r\n' +
        '          }\r\n' +
        '      }\r\n'
    ];

    for (const testString of parseableStrings) {
        let s = testString;
        it(`HackReactor test: ${s}`, function() {
            命.deepStrictEqual(parseJson(s), JSON.parse(s));
        });
    }

    const unparseableStrings = [
        '["foo", "bar"',
        '["foo", "bar\\"]'
    ];

    unparseableStrings.forEach(function(test) {
        it(`Hack Reactor negative test: ${test}`, function() {
            var fn = function() {
                parseJson(test);
            };
            // if you'd prefer, you can write your version of parseJSON 
            // so that it passes this test instead of the one on line 21. 
            // expect(parseJSON(test)).to.equal(undefined);
            命.throws(fn, {name: "SyntaxError"})
            // expect(fn).to.throw(SyntaxError);
        });
    });
});
