type JsonObject = {
    [key: string]: JsonValue
};

type JsonValue = null | boolean | number | string | JsonArray | JsonObject;

type JsonArray = JsonValue[];

class Token {
    constructor(public source: string, public start: number, public endExclusive: number) {}

    useValueParser<T>(valueParser: (s: string) => T): T {
        return valueParser(this.source.substring(this.start, this.endExclusive));
    }
}

interface JsonNode<T> {
    getValue(): T;
}

class NullNode implements JsonNode<null> {
    constructor(public token: Token) {}
    
    getValue() {
        return null;
    }
}

class BooleanNode implements JsonNode<boolean> {
    constructor(public token: Token) {}
    
    getValue() {
        return this.token.useValueParser(s => s === "true");
    }
}

class NumberNode implements JsonNode<number> {
    constructor(public token: Token) {}
    
    getValue() {
        return this.token.useValueParser(parseFloat);
    }
}

class StringNode implements JsonNode<string> {
    constructor(public token: Token) {}
    
    getValue() {
        return this.token.useValueParser(s => {
            return s.replaceAll("\\\"", "\"")
                    .replaceAll("\\\\", "\\")
                    .replaceAll("\\n", "\n")
                    .replaceAll("\\r", "\r")
                    .replaceAll("\\t", "\t");
        });
    }
}

class ArrayNode implements JsonNode<JsonArray> {
    constructor(public token: Token, public elements: JsonNode<JsonValue>[]) {}
 
    getValue() {
        return this.elements.map(element => element.getValue());
    }
}

class ObjectNode implements JsonNode<JsonObject> {
    constructor(public token: Token, public entries: [StringNode, JsonNode<JsonValue>][]) {}

    getValue() {
        const obj: JsonObject = {}; // Object.create(null) better?
        for (const entry of this.entries) {
            const key = entry[0].getValue();
            const value = entry[1].getValue();
            obj[key] = value; // Is Object.defineProperties() a better/more elegant alternative???
        }
        return obj;
    }
}

function isWhitespace(source: string, index: number) {
    return /\s/.test(source.charAt(index)); // no attempt to handle Unicode surrogate pairs
}

function isTokenRightBoundary(source: string, index: number) {
    return index === source.length || /\s|[}\],]/.test(source.charAt(index)); // whitespace or } ] ,
}

function isSign(source: string, index: number) {
    return /[+-]/.test(source.charAt(index));
}

function isDigit(source: string, index: number) {
    return /[0-9]/.test(source.charAt(index));
}

// Find the smallest index greater or equal to `index` such that `source.charAt(index)` is not a whitespace char.
// In particular, if `source.charAt(index)` is not whitespace, just return `index` as given.
// Returns `source.length` if there is only whitespace between `index` and end of string.
function skipUpToNonWhitespace(source: string, index: number) {
    const len = source.length;
    while (index < len && isWhitespace(source, index)) {
        index++;
    }

    return index;
}

// module entry point
function parseJson(source: string) {
    if (source.length === 0) {
        throw new SyntaxError("An empty string is not valid JSON! (But a string containing an empty string is: '\"\"'.)");
    }

    const dataStart = skipUpToNonWhitespace(source, 0);
    const [node, indexWeAdvancedTo] = advanceOneNode(source, dataStart);
    const maybeUnexpectedTail = skipUpToNonWhitespace(source, indexWeAdvancedTo);

    if (maybeUnexpectedTail !== source.length) {
        throw new SyntaxError(`Unexpected trailing characters at position ${indexWeAdvancedTo}!`);
    }

    return node.getValue();
}

function advanceOneNode(source: string, index: number): [JsonNode<JsonValue>, number] {
    const i = index;

    if (i === source.length) {
        throw new SyntaxError(`Unexpected end of input while looking for next value after position ${index}!`);
    }

    let node: JsonNode<JsonValue>;
    let indexWeAdvancedTo: number;

    switch (source.charAt(i)) {
        case "{":
            [node, indexWeAdvancedTo] = getObjectNode(source, index);
            break;
        case "[":
            [node, indexWeAdvancedTo] = getArrayNode(source, index);
            break;
        case "-": // L
        case "0": // O
        case "1": // O
        case "2": // O
        case "3": // O
        case "4": // O
        case "5": // O
        case "6": // O
        case "7": // O
        case "8": // O
        case "9": // L
            [node, indexWeAdvancedTo] = getNumberNode(source, i);
            break;
        case "n":
            [node, indexWeAdvancedTo] = getNullNode(source, i);
            break;
        case "t":
        case "f":
            [node, indexWeAdvancedTo] = getBooleanNode(source, i);
            break;
        case "\"":
            [node, indexWeAdvancedTo] = getStringNode(source, i);
            break;
        default:
            throw new SyntaxError(`Error parsing JSON at character position ${i}!`);
    }

    return [node, indexWeAdvancedTo];
}

function getNullNode(source: string, index: number): [NullNode, number] {
    if (source.length < index + 4) {
        throw new SyntaxError(`Unexpected end of input while trying to parse "null" at position ${index}!`);
    }

    if (source.substring(index, index + 4) !== "null") {
        throw new SyntaxError(`Unable to parse "null" at position ${index}!`)
    }

    const token = new Token(source, index, index + 4);
    const node = new NullNode(token);
    return [node, index + 4];
}

// By this point we know that the current character is either "t" or "f".
function getBooleanNode(source: string, index: number): [BooleanNode, number] {
    switch (source.charAt(index)) {
        case "t": {
            if (source.length < index + 4) {
                throw new SyntaxError(`Unexpected end of input while trying to parse "true" at position ${index}!`);
            }

            if (source.substring(index, index + 4) !== "true") {
                throw new SyntaxError(`Unable to parse "true" at position ${index}!`)
            }

            const token = new Token(source, index, index + 4);
            const node = new BooleanNode(token);
            return [node, index + 4];
        }
        default: {
            if (source.length < index + 5) {
                throw new SyntaxError(`Unexpected end of input while trying to parse "false" at position ${index}!`);
            }

            if (source.substring(index, index + 5) !== "false") {
                throw new SyntaxError(`Unable to parse "false" at position ${index}!`)
            }

            const token = new Token(source, index, index + 5);
            const node = new BooleanNode(token);
            return [node, index + 5];
        }
    }
}

function getStringNode(source: string, index: number): [StringNode, number] {
    let i = index + 1; // Step over opening quotation mark.
    const len = source.length;

    while (i < len && source.charAt(i) !== "\"") {
        if (source.charAt(i) === "\\") { // Handle potential escape sequence.
            if (i + 1 === len) {
                throw new SyntaxError(`Unexpected end of input while parsing escape sequence at position ${i}!`);
            }

            i++; // Advance to character after /.
            const char = source.charAt(i);

            // \", \\, \n, \r, \t, that's reasonable, right?
            if (char !== "\"" && char !== "\\" && char !== "n" && char !== "r" && char !== "t") {
                throw new SyntaxError(`Unknown escape sequence \\${char} at position ${i - 1}!`);
            }
        }

        if (/[\t\n\r]/.test(source.charAt(i))) {
            throw new SyntaxError(`Unescaped control sequence at position ${i}!`);
        }

        i++; // Advance to next character.
    }

    if (i === len) {
        throw new SyntaxError(`Unexpected end of input while parsing a string at position ${index}!`);
    }

    const token = new Token(source, index + 1, i);
    const node = new StringNode(token);
    return [node, i + 1];
}

// valid JSON numbers: 5  5.0  -5  -5.0  5e0  5.0e0  -5.0e0  5.0e+0  5.0e-0  5.0E-0
// not valid: -  05  5.  .5  e0  5e0.5  hexadecimal/octal
function getNumberNode(source: string, index: number): [NumberNode, number] {
    let i = index;
    const len = source.length;
    let leadingMinus = source.charAt(i) === "-";

    let seenPoint = false;
    let seenExp = false;

    if (leadingMinus) {
        i++;
        if (isTokenRightBoundary(source, i) || !isDigit(source, i)) {
            throw new SyntaxError(`Encountered invalid character while parsing a number at position ${i}!`);
        }
    }

    // immediately check for invalid number with leading zeros
    if (i < len && source.charAt(i) === "0" && !isTokenRightBoundary(source, i + 1)) {
        i++;
        if (source.charAt(i) !== ".") {
            throw new SyntaxError(`Encountered unexpected leading zeros while parsing a number at position ${i}!`);
        }
    }

    if (!leadingMinus) {
        i++; // step over first character, which is what already triggered this function
    }

    while (true) {
        if (isTokenRightBoundary(source, i)) {
            break;
        }

        const c = source.charAt(i);

        if (c === ".") {
            if (seenPoint || seenExp) {
                throw new SyntaxError(`Encountered invalid character while parsing a number at position ${i}!`);
            } else {
                i++;
                if (i === len) {
                    throw new SyntaxError(`Encountered unexpected end of input while parsing a number at position ${i}!`);
                } else if (isDigit(source, i)) {
                    seenPoint = true;
                    i++;
                } else {
                    throw new SyntaxError(`Encountered unexpected character while parsing a number at position ${i}!`);
                }
            }
            continue;
        }

        if (c === "e" || c === "E") {
            if (seenExp) {
                throw new SyntaxError(`Encountered invalid character while parsing a number at position ${i}!`);
            } else {
                i++;
                if (i === len) {
                    throw new SyntaxError(`Encountered unexpected end of input while parsing a number at position ${i}!`);
                } else if (isSign(source, i) || isDigit(source, i)) {
                    seenExp = true;
                    i++;
                } else {
                    throw new SyntaxError(`Encountered unexpected character while parsing a number at position ${i}!`);
                }
            }
            continue;
        }

        if (isDigit(source, i)) {
            i++;
            continue;
        }

        throw new SyntaxError(`Encountered invalid character while parsing a number at position ${i}!`);
    }

    const token = new Token(source, index, i);
    const node = new NumberNode(token);
    return [node, i];
}

function getArrayNode(source: string, index: number): [ArrayNode, number] {
    const children: JsonNode<any>[] = [];
    const len = source.length;
    let i = skipUpToNonWhitespace(source, index + 1); // step over opening [ and skip whitespace

    if (i === len) {
        throw new SyntaxError(`Encountered unexpected end of input while parsing an array starting at ${index}!`);
    }

    if (source.charAt(i) === ",") {
        throw new SyntaxError(`Invalid leading comma in array literal beginning at position ${index}!`);
    }

    let expectAnotherChild = false;

    while (true) {
        if (i === len) {
            throw new SyntaxError(`Encountered unexpected end of input while parsing an array starting at ${index}!`);
        }

        if (source.charAt(i) === ']') {
            if (!expectAnotherChild) {
                break; // end of array
            } else {
                throw new SyntaxError(`Invalid trailing comma in array literal beginning at position ${index}!`);
            }
        }

        const [node, advancedTo] = advanceOneNode(source, i);
        children.push(node);
        expectAnotherChild = false;
        i = skipUpToNonWhitespace(source, advancedTo);

        if (i === len) {
            throw new SyntaxError(`Encountered unexpected end of input while parsing an array starting at ${index}!`);
        }

        // step over comma and any subsequent whitespace and set the flag to expect another child
        if (source.charAt(i) === ",") {
            expectAnotherChild = true;
            i = skipUpToNonWhitespace(source, i + 1);
        } else if (source.charAt(i) !== "]") {
            throw new SyntaxError(`Encountered unexpected character while parsing array element at position ${i}!`);
        }
    }

    // i ends up being the last *seen* character -- we indicate that first *unseen* character is i + 1
    const token = new Token(source, index, i + 1);
    const node = new ArrayNode(token, children);
    return [node, i + 1];
}

function getObjectNode(source: string, index: number): [ObjectNode, number] {
    const entries: [StringNode, JsonNode<any>][] = [];
    const len = source.length;
    let i = skipUpToNonWhitespace(source, index + 1); // step over opening { and skip whitespace

    if (i === len) {
        throw new SyntaxError(`Encountered unexpected end of input while parsing object literal starting at ${index}!`);
    }

    let expectAnotherEntry = false;

    while (true) {
        if (i === len) {
            throw new SyntaxError(`Encountered unexpected end of input while parsing object literal starting at ${index}!`);
        }

        if (source.charAt(i) === '}') {
            if (!expectAnotherEntry) {
                break; // end of object
            } else {
                throw new SyntaxError(`Invalid trailing comma in object literal beginning at position ${index}!`);
            }
        }

        if (source.charAt(i) !== "\"") {
            throw new SyntaxError(`Unable to parse key string in object literal at position ${i}!`);
        }

        const [keyNode, advancedTo] = getStringNode(source, i);
        i = skipUpToNonWhitespace(source, advancedTo);

        if (i === len || source.charAt(i) !== ":") {
            throw new SyntaxError(`Unable to parse value string in object literal at position ${i}!`);
        }

        i = skipUpToNonWhitespace(source, i + 1); // step over key-value separator ':' and advance to value
        const [valueNode, advancedTo2] = advanceOneNode(source, i);
        expectAnotherEntry = false;
        i = skipUpToNonWhitespace(source, advancedTo2);

        if (i === len) {
            throw new SyntaxError(`Unexpected end of input while parsing object literal starting at ${index}!`);
        }

        // step over comma and any subsequent whitespace and set the flag to expect another entry
        if (source.charAt(i) === ",") {
            expectAnotherEntry = true;
            i = skipUpToNonWhitespace(source, i + 1);
        }

        entries.push([keyNode, valueNode]);
    }

    // i ends up being the last *seen* character -- we indicate that first *unseen* character is i + 1
    const token = new Token(source, index, i + 1);
    const node = new ObjectNode(token, entries);
    return [node, i + 1];
}

export { parseJson };
