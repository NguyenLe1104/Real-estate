"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDateTime = formatDateTime;
function formatDateTime(date) {
    return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date));
}
//# sourceMappingURL=format-datetime.js.map