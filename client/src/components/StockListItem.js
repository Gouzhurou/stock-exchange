import React from "react";
import "../css/ListItem.css"
import {useWebSocket} from "../WebSocketContext";

class StockListItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: [],
            prevPrice: null,
            currentPrice: null,
            currentDateIndex: -1
        }

        this.intervalId = null;

        this.handleSelectedClick = this.handleSelectedClick.bind(this);
        this.YYYYMMDDToMMDDYYYY = this.YYYYMMDDToMMDDYYYY.bind(this);
        this.dateToMMDDYYYY = this.dateToMMDDYYYY.bind(this);
        this.MMDDYYYYtoDDMMYYYY = this.MMDDYYYYtoDDMMYYYY.bind(this);
        this.startPriceInterval = this.startPriceInterval.bind(this);
        this.stopPriceInterval = this.stopPriceInterval.bind(this);
        this.findFirstDate = this.findFirstDate.bind(this);
        this.sendPriceUpdate = this.sendPriceUpdate.bind(this);
    }

    // выполняется сразу после монтирования
    async componentDidMount() {
        const {hostname, protocol} = window.location;
        const response = await fetch(`${protocol}//${hostname}:3001/stocks/${this.props.stock.id}`);

        const data = await response.json();
        this.setState({data: data})

        const { socket } = this.props;
        if (socket) {
            socket.on('startTradingConfirmed', (data) => {
                console.log('Trading start confirmed:', data.message);
            });
        }
    }

    // выполняется при изменениях в props
    componentDidUpdate(prevProps) {
        if (prevProps.isSimulationRunning !== this.props.isSimulationRunning ||
            prevProps.stock.selected !== this.props.stock.selected ||
            prevProps.date !== this.props.date) {

            this.handleSimulationChange();
        }
    }

    // выполняется при размонтировании
    componentWillUnmount() {
        this.stopPriceInterval();
    }

    sendPriceUpdate(index, prevPrice, currentPrice) {
        const { stock, socket } = this.props;
        if (socket && socket.connected && stock.selected) {
            const { data } = this.state;

            const updateData = {
                stockId: stock.id,
                date: this.MMDDYYYYtoDDMMYYYY(data[index].date),
                open: currentPrice,
                difference: (currentPrice - prevPrice).toFixed(2),
            };

            socket.emit('priceUpdate', updateData);
            console.log('Sending price update:', updateData);
        }
    }

    handleSimulationChange() {
        const { isSimulationRunning, stock, socket } = this.props;

        if (isSimulationRunning && stock.selected) {
            const startIndex = this.findFirstDate();

            if (startIndex !== -1) {
                const { data } = this.state;
                const initialPrice = data[startIndex]?.open || null;

                const tradingData = {
                    period: this.props.period,
                    stockId: stock.id,
                    date: this.MMDDYYYYtoDDMMYYYY(data[startIndex].date),
                    open: data[startIndex].open,
                    difference: null
                }

                socket.emit('startTrading', tradingData);
                console.log('Trading has started:', tradingData);

                this.setState({
                    currentDateIndex: startIndex,
                    currentPrice: initialPrice
                }, () => {
                    this.startPriceInterval();
                });
            }
        } else {
            this.stopPriceInterval();
        }
    }

    findFirstDate() {
        const { date } = this.props;
        const { data } = this.state;

        const targetDate = this.YYYYMMDDToMMDDYYYY(date);

        let index = data.findIndex(day => day.date === targetDate);
        if (index !== -1) {
            return index;
        }

        let currentDate = new Date(date);

        for (let i = 1; i <= 3; i++) {
            const nextDate = new Date(currentDate);
            nextDate.setDate(currentDate.getDate() + i);

            const formattedNextDate = this.dateToMMDDYYYY(nextDate);

            index = data.findIndex(day => day.date === formattedNextDate);
            if (index !== -1) {
                return index;
            }
        }

        return -1;
    }

    handleSelectedClick() {
        this.props.onUpdate(this.props.stock.id);
    }

    YYYYMMDDToMMDDYYYY(date) {
        const [year, month, day] = date.split('-');
        return `${month}/${day}/${year}`;
    }

    MMDDYYYYtoDDMMYYYY(date) {
        const [month, day, year] = date.split('/');
        return `${day}.${month}.${year}`;
    }

    dateToMMDDYYYY(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${month}/${day}/${year}`;
    }

    startPriceInterval() {
        this.stopPriceInterval();

        this.intervalId = setInterval(() => {
            this.setState(prevState => {
                const { data, currentDateIndex, currentPrice } = prevState;
                const { period } = this.props;
                const nextIndex = currentDateIndex + parseInt(period, 10);

                if (nextIndex < data.length) {
                    const nextPrice = data[nextIndex].open;

                    return {
                        prevPrice: currentPrice,
                        currentPrice: nextPrice,
                        currentDateIndex: nextIndex
                    };
                } else {
                    this.props.onSimulationEnd();

                    return {
                        currentPrice: null,
                        prevPrice: null,
                        currentDateIndex: -1
                    };
                }
            }, () => {
                // вызывается после завершения setState
                const { currentDateIndex, prevPrice, currentPrice } = this.state;

                if (currentDateIndex !== -1) {
                    this.sendPriceUpdate(currentDateIndex, prevPrice, currentPrice);
                } else {
                    this.stopPriceInterval();
                }
            });
        }, 1000);
    }

    stopPriceInterval() {
         if (this.intervalId) {
             const { socket, stock } = this.props;

             clearInterval(this.intervalId);
             this.intervalId = null;

             this.setState({
                 currentPrice: null,
                 prevPrice: null,
                 currentDateIndex: -1
             });

             socket.emit('stopTrading');
             console.log('Trading has stopped: ', stock.id);
        }
    }

    render() {
        const { stock, isSimulationRunning } = this.props;
        const { prevPrice, currentPrice } = this.state;

        return (
            <div className="settings__list-item">
                <div className={`checkbox ${stock.selected ? 'checkbox-selected' : ''}`} />

                <div
                    className="settings__content"
                    onClick={this.handleSelectedClick}
                >
                    <div className="list-item-content">
                        <p className="list-item__heading">{stock.name}</p>
                        <p className="list-item__subheading">{stock.id}</p>
                    </div>

                    <div className="list-item-content right-side">
                        <p className=
                               {`
                               list-item__heading 
                               ${isSimulationRunning && stock.selected && currentPrice !== null ? 'price' : ''}
                               `}
                        >
                            {isSimulationRunning && stock.selected && currentPrice !== null
                                ? `${currentPrice}`
                                : ""
                            }
                        </p>
                        <p className="list-item__subheading">1 лот = {stock.count} акция</p>
                    </div>

                    <div className="list-item-content right-side">
                        {isSimulationRunning && stock.selected && currentPrice && prevPrice && (
                            <>
                                <p className={`list-item__heading price ${currentPrice >= prevPrice ? 'green-text' : 'red-text'}`}>
                                    {(currentPrice - prevPrice).toFixed(2)}
                                </p>
                                <p className={`list-item__heading percent ${currentPrice >= prevPrice ? 'green-text' : 'red-text'}`}>
                                    {Math.abs(((currentPrice - prevPrice) / prevPrice) * 100).toFixed(2)}
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        )
    }
}

export default function StockListItemWrapper(props) {
    const { socket, isConnected } = useWebSocket();

    return <StockListItem {...props} socket={socket} isConnected={isConnected} />;
}