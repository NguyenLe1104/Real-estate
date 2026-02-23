import { Module } from '@nestjs/common';
import { LandService } from './land.service';
import { LandController } from './land.controller';
import { CloudinaryModule } from '../../common/cloudinary/cloudinary.module';

@Module({
    imports: [CloudinaryModule],
    controllers: [LandController],
    providers: [LandService],
    exports: [LandService],
})
export class LandModule { }
