import "../Broker.css"
import React from "react";

class Broker extends React.Component {
    constructor(props) {
        super(props);

        this.handleEditClick = this.handleEditClick.bind(this);
        this.handleBrokerClick = this.handleBrokerClick.bind(this);
    }

    handleEditClick() {
        const newBroker = {
            ...this.props.broker,
            isEditing: !this.props.broker.isEditing
        };
        this.props.onUpdate(newBroker);
    }

    handleBrokerClick() {
        const newBroker = {
            ...this.props.broker,
            selected: !this.props.broker?.selected
        };
        this.props.onUpdate(newBroker);
    }

    render() {
        const { broker } = this.props;

        return (
            <div className="list-item">
                <div className="row list-item__top">
                    <div
                        className="row list-item-intro"
                        onClick={this.handleBrokerClick}
                    >
                        {
                            broker.selected ? (
                                <div className="checkbox checkbox-selected"/>
                        ) : (
                            <div className="checkbox"/>
                            )}
                        <div className="list-item-content">
                            <p className="list-item-content__top">{broker.name}</p>
                            <p className="list-item-content__bottom price">{broker.balance}</p>
                        </div>
                    </div>

                    <button id="edit-button" onClick={this.handleEditClick}></button>
                </div>

                {
                    broker.isEditing && (
                        <div className="list-item__bottom">
                            <button className="button">Отжать</button>
                            <input className="input" type="number" placeholder="Price"/>
                            <button className="button">Добавить</button>
                        </div>
                )}

            </div>
        )
    }
}

export default Broker;