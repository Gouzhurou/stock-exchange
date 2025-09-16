import {Injectable} from "@nestjs/common";
import {join} from "path";
import { existsSync } from 'fs';
import type { Response } from 'express';

@Injectable()
export class ImagesService {
    private readonly uploadsPath = join(__dirname, '..', '..', 'images');

    getImages(imageName: string, res: Response) {
        const safeImageName = this.validateImageName(imageName);
        const imagePath = join(this.uploadsPath, safeImageName);

        try {
            return res.sendFile(imagePath);
        } catch (error) {
            return res.status(404).send('Image not found');
        }
    }

    private validateImageName(imageName: string): string {
        if (imageName.includes('..') || imageName.includes('/') || imageName.includes('\\')) {
            return 'question.jpg';
        }
        return imageName;
    }
}