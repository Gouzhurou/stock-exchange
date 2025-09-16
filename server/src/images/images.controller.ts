import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import {ImagesService} from "./images.service";

@Controller('images')
export class ImagesController {
    constructor(private readonly imagesService: ImagesService) {}
    
    @Get(':imageName')
    getImage(@Param('imageName') imageName: string, @Res() res: Response) {
        this.imagesService.getImages(imageName, res);
    }
}