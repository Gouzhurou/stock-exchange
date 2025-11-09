import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(3002, {
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:8080'],
        methods: ['GET', 'POST'],
        credentials: true
    },
    transports: ['websocket', 'polling']
})
export class TradingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private clients = new Map<string, { socket: Socket, brokerName: string }>();

    handleConnection(client: Socket) {
        const clientId = client.id;
        const brokerName = client.handshake.query.brokerName as string;

        this.clients.set(clientId, {
            socket: client,
            brokerName: brokerName || 'Unknown Broker'
        });

        console.log(`Client connected: ${clientId}, Broker: ${brokerName}`);
        console.log(`Total clients: ${this.clients.size}`);

        client.emit('connected', {
            status: 'connected',
            clientId,
            brokerName,
            message: 'Successfully connected to trading server'
        });
    }

    handleDisconnect(client: Socket) {
        const clientId = client.id;
        const clientData = this.clients.get(clientId);

        if (clientData) {
            console.log(`Client disconnected: ${clientId}, Broker: ${clientData.brokerName}`);
            this.clients.delete(clientId);
        } else {
            console.log(`Client disconnected: ${clientId}`);
        }

        console.log(`Total clients: ${this.clients.size}`);
    }

    // React администратор запускает торги
    @SubscribeMessage('startTrading')
    handleStartTrading(client: Socket, data: any) {
        // console.log('Trading started:', data);

        this.server.emit('tradingStarted', {
            type: 'TRADING_STARTED',
            data: data,
        });

        // Подтверждение администратору
        client.emit('startTradingConfirmed', {
            status: 'success',
            message: 'Trading started successfully'
        });
    }

    // React администратор обновляет цены
    @SubscribeMessage('priceUpdate')
    handlePriceUpdate(client: Socket, data: any) {
        // console.log('Price update:', data);

        this.server.emit('priceUpdated', {
            type: 'PRICE_UPDATED',
            data: data,
        });
    }

    // Остановка торгов
    @SubscribeMessage('stopTrading')
    handleStopTrading(client: Socket) {
        console.log('Trading stopped');

        this.server.emit('tradingStopped', {
            type: 'TRADING_STOPPED',
            data: {
                message: 'Trading session ended'
            },
        });
    }

    @SubscribeMessage('updateBalance')
    handleUpdateBalance(client: Socket, data: any) {
        const clientId = client.id;
        const clientData = this.clients.get(clientId);

        console.log(`Balance update from ${clientData?.brokerName}:`, data);

        this.server.emit('balanceUpdated', {
            type: 'BALANCE_UPDATED',
            data: {
                ...data,
                updatedBy: clientData?.brokerName
            }
        })
    }

    @SubscribeMessage('purchaseStock')
    handleStockTransaction(client: Socket, data: any) {
        const clientId = client.id;
        const clientData = this.clients.get(clientId);

        console.log(`${clientData?.brokerName} made stock transaction`, data);

        this.server.emit('stockPurchased', {
            type: 'STOCK_PURCHASED',
            data: data
        })
    }

    // Получение списка клиентов
    @SubscribeMessage('getClients')
    handleGetClients(client: Socket) {
        const clients = Array.from(this.clients.keys());
        client.emit('clientsList', { clients });
    }
}