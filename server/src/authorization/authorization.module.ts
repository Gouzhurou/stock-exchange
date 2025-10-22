import { Module } from '@nestjs/common'
import { AuthorizationController } from "./authorization.controller";
import { AuthorizationService } from "./authorization.service";
import {BrokersModule} from "../brokers/brokers.module";

@Module( {
    imports: [BrokersModule],
    controllers: [AuthorizationController],
    providers: [AuthorizationService],
})
export class AuthorizationModule {}