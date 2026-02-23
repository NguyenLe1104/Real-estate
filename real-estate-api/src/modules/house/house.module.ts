import { Module } from '@nestjs/common';
import { HouseService } from './house.service';
import { HouseController } from './house.controller';
import { CloudinaryModule } from '../../common/cloudinary/cloudinary.module';

@Module({
    imports: [CloudinaryModule],
    controllers: [HouseController],
    providers: [HouseService],
    exports: [HouseService],
})
export class HouseModule { }
