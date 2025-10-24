import {Body, Controller, Post, Res} from '@nestjs/common';
import {AuthorizationService} from "./authorization.service";
import type { Response } from 'express';

@Controller('authorization')
export class AuthorizationController {
    constructor(private readonly authorizationService: AuthorizationService) {}

    @Post()
    async login(@Body() loginData: { name: string }, @Res() res: Response) {
        const broker = await this.authorizationService.validateBroker(loginData.name);

        if (broker) {
            return res.status(200).json({
                success: true,
                broker: broker
            });
        } else {
            return res.status(401).json({
                success: false,
                message: 'Брокер не найден'
            });
        }
    }
}