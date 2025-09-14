import { Injectable } from '@nestjs/common';
import {readFileSync, writeFileSync} from 'fs';
import { join } from 'path';

@Injectable()
export class StocksService {
    private readonly dataPath = join(process.cwd(), 'data', 'stocks.json');

    getStocks() {
        const data = readFileSync(this.dataPath, 'utf8');
        return JSON.parse(data);
    }

    getStock(id: string) {
        const filePath = join(process.cwd(), 'data', 'stocks', `${id}.json`);

        const data = readFileSync(filePath, 'utf8');

        return JSON.parse(data);
    }

    updateStock(id: string) {
        const jsonData = this.getStocks()

        const stockIndex = jsonData.stocks.findIndex(stock => stock.id === id);
        if (stockIndex === -1) {
            return { success: false, error: 'Stock not found' };
        }

        const selected = jsonData.stocks[stockIndex].selected;
        jsonData.stocks[stockIndex].selected = !selected;

        writeFileSync(this.dataPath, JSON.stringify(jsonData, null, 2), 'utf8');

        return {success: true};
    }
}