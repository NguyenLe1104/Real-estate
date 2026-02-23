"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginate = paginate;
function paginate(items, total, page, limit) {
    return {
        data: items,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
    };
}
//# sourceMappingURL=pagination.js.map