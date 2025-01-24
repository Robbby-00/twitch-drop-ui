import assert from "assert";

export enum ISettingTypes {
    STRING = "string",
    NUMBER = "number",
    BOOLEAN = "boolean",
    PATH = "path"
}

// asserts
assert.equal(ISettingTypes.STRING, typeof "", "Mismatch setting types ISettingTypes.STRING")
assert.equal(ISettingTypes.NUMBER, typeof 0, "Mismatch setting types ISettingTypes.NUMBER")
assert.equal(ISettingTypes.BOOLEAN, typeof true, "Mismatch setting types ISettingTypes.BOOLEAN")