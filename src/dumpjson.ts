const typeOfNumber = typeof 0;
const typeOfString = typeof "";
const typeOfBoolean = typeof true;
const typeOfObject = typeof {};

export function dumpJson(value: any): string | undefined {
    const typeOfValue = typeof value;

    if (typeOfValue === typeOfNumber) {
        return dumpNumber(value);
    } else if (typeOfValue === typeOfString) {
        return dumpString(value);
    } else if (typeOfValue === typeOfBoolean) {
        return dumpBoolean(value);
    } else if (value === null) {
        return dumpNull(value);
    } else if (value instanceof Date) {
        return dumpDate(value);
    } else if (Array.isArray(value)) {
        return dumpArray(value);
    } else if (typeOfValue === typeOfObject) {
        return dumpObject(value);
    } else {
        return undefined;
    }
}

function dumpNumber(value: number): string {
    if (Number.isNaN(value) || !Number.isFinite(value)) { /* "the more you know" */
        return "null";
    } else {
        return Number.prototype.toString.call(value);
    }
}

const escapes: {[key: string]: string} = {
    '"': '\\"',
    "\\": "\\\\",
    "\n": "\\n",
    "\r": "\\r",
    "\t": "\\t"
}

function dumpString(value: string): string {
    return `"${value.replaceAll(/["\\\n\r\t]/g, match => escapes[match])}"`;
}

function dumpBoolean(value: boolean) {
    return Boolean.prototype.toString.call(value);
}

function dumpNull(value: null): string {
    return "null";
}

function dumpDate(value: Date): string {
    return `"${value.toJSON()}"`;
}

function dumpArray(value: Array<any>) {
    const mappedContents = value.map(elem => {
        const dumped = dumpJson(elem);
        if (dumped === undefined) {
            return "null"; /* JSON.stringify() seems to replace bad array elements with "null" instead of skipping */
        } else {
            return dumped;
        }
    });
    return `[${mappedContents.join(",")}]`;
}

const keyMapper = (key: PropertyKey) => dumpString(String(key));
const valMapper = dumpJson;
const entryMapper = (key: PropertyKey, val: any) => {
    const mappedKey = keyMapper(key);
    const mappedVal = valMapper(val);
    if (mappedVal !== undefined) {
        return `${mappedKey}:${mappedVal}`;
    } else {
        return null;
    }
};

function dumpObject(value: {[key: PropertyKey]: any}): string {
    let keys = Object.getOwnPropertyNames(value);
    // keys = keys.sort(); /* turns out JSON.stringify() does not first sort keys */
    keys = keys.filter(key => Object.getOwnPropertyDescriptor(value, key)?.enumerable)
    const keyAndValStrings = keys.map(key => entryMapper(key, value[key]))
                                 .filter(x => x !== null); /* because not all entries have valid output */
    return `{${keyAndValStrings}}`;
}
