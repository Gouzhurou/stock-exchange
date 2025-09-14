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

    handleBalanceClick() {
        const newBalance = this.props.broker?.balance + parseInt(this.state.balance);
        const newBroker = {
            ...this.props.broker,
            balance: newBalance
        };
        this.props.onUpdate(newBroker);
        this.setState({balance: ""});
    }

    handleNegativeBalanceClick() {
        const newBalance = this.props.broker?.balance + parseInt(this.state.balance) * (-1);
        const newBroker = {
            ...this.props.broker,
            balance: newBalance
        };
        this.props.onUpdate(newBroker);
        this.setState({balance: ""});
    }

    render() {
        const { broker } = this.props;

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

                    <button id="edit-button" onClick={this.handleEditClick}></button>
                </div>

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