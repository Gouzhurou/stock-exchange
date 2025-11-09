import "../css/ListItem.css"
import React from "react";

class Broker extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            balance: ""
        }

        this.handleEditClick = this.handleEditClick.bind(this);
        this.handleSelectedClick = this.handleSelectedClick.bind(this);
        this.handleBalanceClick = this.handleBalanceClick.bind(this);
        this.onChangeBalance = this.onChangeBalance.bind(this);
        this.handleNegativeBalanceClick = this.handleNegativeBalanceClick.bind(this);
    }

    handleEditClick() {
        const newBroker = {
            ...this.props.broker,
            isEditing: !this.props.broker.isEditing
        };
        this.props.onUpdate(newBroker);
    }

    handleSelectedClick() {
        const newBroker = {
            ...this.props.broker,
            selected: !this.props.broker?.selected
        };
        this.props.onUpdate(newBroker);
    }

    onChangeBalance(e) {
        this.setState({balance: e.target.value});
    }

    async handleBalanceChange(isDeposit) {
        const amount = parseInt(this.state.balance);
        if (isNaN(amount) || amount <= 0) {
            return;
        }

        const newBalance = isDeposit
            ? this.props.broker?.balance + amount
            : this.props.broker?.balance - amount;

        const newBroker = {
            ...this.props.broker,
            balance: newBalance
        };

        const updateSuccess = await this.props.onUpdate(newBroker);

        if (updateSuccess) {
            const { socket } = this.props;
            if (socket && socket.connected) {
                socket.emit('updateBalance', {
                    brokerId: this.props.broker.id,
                    newBalance: newBalance,
                    operation: isDeposit ? 'deposit' : 'withdraw',
                    amount: amount
                });
            }
        }

        this.setState({balance: ""});
    }

    handleBalanceClick() {
        this.handleBalanceChange(true);
    }

    handleNegativeBalanceClick() {
        this.handleBalanceChange(false);
    }

    render() {
        const { broker, stocksData } = this.props;

        return (
            <div className="list-item">
                <div className="row list-item__top">
                    <div
                        className="row list-item-intro"
                        onClick={this.handleSelectedClick}
                    >
                        <div className={`checkbox ${broker.selected ? 'checkbox-selected' : ''}`} />
                        <div className="list-item-content">
                            <p className="list-item__heading">{broker.name}</p>
                            <p className="list-item__subheading price">{broker.balance}</p>
                        </div>
                    </div>

                    <button className="edit-button" onClick={this.handleEditClick}></button>
                </div>

                {
                    broker.stocks && Object.entries(broker.stocks).map(([stockId, stockData]) => {
                        const currentPrice = stocksData[stockId]?.currentPrice;

                        if (currentPrice) {
                            const difference = (currentPrice * stockData.count - stockData.price).toFixed(2);
                            const differenceText = difference >= 0 ? `+${difference}` : difference;

                            return (
                                <div key={stockId}>
                                    <p className="list-item__heading">{stockId}:</p>
                                    <p className="list-item__subheading">Акций: {stockData.count}</p>
                                    <p className="list-item__subheading price">Стоимость: {currentPrice * stockData.count}</p>
                                    <p className={difference >= 0 ? 'green-text price' : 'red-text price'}>{differenceText}</p>
                                </div>
                            )
                        } else {
                            return (
                                <div key={stockId}>
                                    <p className="list-item__heading">{stockId}:</p>
                                    <p className="list-item__subheading">Акций: {stockData.count}</p>
                                </div>
                            )
                        }
                    })
                }

                {
                broker.isEditing && (
                        <div className="list-item__bottom">
                            <button className="button" onClick={this.handleNegativeBalanceClick}>Отжать</button>
                            <input
                                className="input"
                                type="text"
                                placeholder="Balance"
                                value={this.state.balance}
                                onChange={this.onChangeBalance}
                            />
                            <button className="button" onClick={this.handleBalanceClick}>Добавить</button>
                        </div>
                )}

            </div>
        )
    }
}

export default Broker;