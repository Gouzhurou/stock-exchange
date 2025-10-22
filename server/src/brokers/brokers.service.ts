import { Injectable } from '@nestjs/common';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import {StocksService} from "../stocks/stocks.service";

@Injectable()
export class BrokersService {
    constructor(private readonly stocksService: StocksService) {}

    private readonly dataPath = join(process.cwd(), 'data', 'brokers.json');

    getBrokers() {
        const data = readFileSync(this.dataPath, 'utf8');
        return JSON.parse(data);
    }

    getEmptyStockCounts() {
        const stocks = this.stocksService.getStocks().stocks;
        const stockIds = stocks.map(stock => stock.id);
        const emptyStockCounts = {};

        stockIds.forEach(id => {
            emptyStockCounts[id] = 0;
        })

        return emptyStockCounts;
    }

    addBroker(broker: any) {
        const jsonData = this.getBrokers();

        const newBroker = {
            id: Date.now(),
            name: broker.name,
            balance: broker.balance || 0,
            selected: false,
            isEditing: false,
            stockCount: this.getEmptyStockCounts(),
        };

        jsonData.brokers.push(newBroker);

        writeFileSync(this.dataPath, JSON.stringify(jsonData, null, 2), 'utf8');

        return {success: true, broker: newBroker};
    }

    deleteBrokers() {
        const jsonData = this.getBrokers();

        jsonData.brokers = jsonData.brokers.filter((broker) => broker.selected == false);

        writeFileSync(this.dataPath, JSON.stringify(jsonData, null, 2), 'utf8');

        return {success: true};
    }

    updateBroker(id: number, brokerData: any) {
        const jsonData = this.getBrokers();

        const brokerIndex = jsonData.brokers.findIndex(broker => broker.id === id);
        if (brokerIndex === -1) {
            return { success: false, errorMassage: 'Broker not found' };
        }

        jsonData.brokers[brokerIndex] = brokerData;

        writeFileSync(this.dataPath, JSON.stringify(jsonData, null, 2), 'utf8');

        return {success: true};
    }
}