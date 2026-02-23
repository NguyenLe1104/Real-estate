"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasSpecialChars = hasSpecialChars;
exports.validateFieldsNoSpecialChars = validateFieldsNoSpecialChars;
const specialCharsRegex = /[<>{}$`\\|;]/;
function hasSpecialChars(value) {
    return specialCharsRegex.test(value);
}
function validateFieldsNoSpecialChars(fields) {
    return fields.some((field) => field && hasSpecialChars(field));
}
//# sourceMappingURL=validators.js.map