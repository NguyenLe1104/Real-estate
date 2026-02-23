"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const user_module_1 = require("./modules/user/user.module");
const role_module_1 = require("./modules/role/role.module");
const customer_module_1 = require("./modules/customer/customer.module");
const employee_module_1 = require("./modules/employee/employee.module");
const property_category_module_1 = require("./modules/property-category/property-category.module");
const house_module_1 = require("./modules/house/house.module");
const land_module_1 = require("./modules/land/land.module");
const appointment_module_1 = require("./modules/appointment/appointment.module");
const post_module_1 = require("./modules/post/post.module");
const favorite_module_1 = require("./modules/favorite/favorite.module");
const featured_module_1 = require("./modules/featured/featured.module");
const profile_module_1 = require("./modules/profile/profile.module");
const cloudinary_module_1 = require("./common/cloudinary/cloudinary.module");
const mail_module_1 = require("./common/mail/mail.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            cloudinary_module_1.CloudinaryModule,
            mail_module_1.MailModule,
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            role_module_1.RoleModule,
            customer_module_1.CustomerModule,
            employee_module_1.EmployeeModule,
            property_category_module_1.PropertyCategoryModule,
            house_module_1.HouseModule,
            land_module_1.LandModule,
            appointment_module_1.AppointmentModule,
            post_module_1.PostModule,
            favorite_module_1.FavoriteModule,
            featured_module_1.FeaturedModule,
            profile_module_1.ProfileModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map