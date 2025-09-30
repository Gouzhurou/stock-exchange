import { Module } from '@nestjs/common'
import { AuthorizationController } from "./authorization.controller";
import { AuthorizationService } from "./authorization.service";
import {BrokersService} from "../brokers/brokers.service";

@Module( {
    controllers: [AuthorizationController],
    providers: [AuthorizationService, BrokersService],
})
export class AuthorizationModule {}