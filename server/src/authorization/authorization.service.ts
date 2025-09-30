import { Injectable } from '@nestjs/common';
import {BrokersService} from "../brokers/brokers.service";

@Injectable()
export class AuthorizationService {
    constructor(private readonly brokersService: BrokersService) {}

    async validateBroker(name: string) {
        const brokers = this.brokersService.getBrokers().brokers;
        const broker = brokers.find(b => b.name === name);

        if (broker) {
            return broker;
        }
        return null;
    }
}