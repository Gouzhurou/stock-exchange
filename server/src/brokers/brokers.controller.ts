import {Body, Controller, Delete, Get, Param, Post, Put} from '@nestjs/common';
import { BrokersService } from './brokers.service';

@Controller('brokers')
export class BrokersController {
    constructor(private readonly brokersService: BrokersService) {}

    @Get()
    getBrokers() {
        return this.brokersService.getBrokers();
    }

    @Post()
    addBroker(@Body() brokerData: any) {
        return this.brokersService.addBroker(brokerData);
    }

    @Delete()
    deleteBrokers() {
        return this.brokersService.deleteBrokers();
    }

    @Put(':id')
    updateBroker(@Param('id') id: string, @Body() brokerData: any) {
        return this.brokersService.updateBroker(parseInt(id), brokerData);
    }
}