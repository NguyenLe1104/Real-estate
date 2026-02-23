"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOTP = generateOTP;
function generateOTP(length = 6) {
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10).toString();
    }
    return otp;
}
//# sourceMappingURL=generate-otp.js.map