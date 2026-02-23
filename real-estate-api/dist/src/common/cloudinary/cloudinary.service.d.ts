import { UploadApiResponse } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
export declare class CloudinaryService {
    private configService;
    constructor(configService: ConfigService);
    uploadImage(file: Express.Multer.File): Promise<UploadApiResponse>;
    uploadImages(files: Express.Multer.File[]): Promise<UploadApiResponse[]>;
    deleteImage(publicId: string): Promise<any>;
}
