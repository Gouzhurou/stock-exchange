import {Controller, Get, Param, Put} from "@nestjs/common";
import {StocksService} from "./stocks.service";

@Controller('stocks')
export class StocksController {
    constructor(private readonly stocksService: StocksService) {}

    @Get()
    getStocks() {
        return this.stocksService.getStocks();
    }

    @Get(':id')
    getStock(@Param('id') id: string) {
        return this.stocksService.getStock(id);
    }
}