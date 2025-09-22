import React from "react";

import "../css/Stock.css"
import "../css/ListItem.css"
import HistoricalData from "./HistoricalData";

class Stock extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            historicalData: [],
            isLoading: true,
            errorMassage: null
        }

        this.fetchHistoricalData = this.fetchHistoricalData.bind(this);
    }

    componentDidMount() {
        this.fetchHistoricalData();
    }

    fetchHistoricalData = async () => {
        try {
            const {hostname, protocol} = window.location;
            const response = await fetch(`${protocol}//${hostname}:3001/stocks/${this.props.stock.id}`);
            const data = await response.json();
            this.setState({historicalData: data, isLoading: false});
        } catch (error) {
            this.setState({
                error: error.message,
                isLoading: false
            });
            console.errorMassage('Error fetching stock data:', error);
        }
    }

    render() {
        const { stock } = this.props;
        const { historicalData, loading, error } = this.state;
        const {hostname, protocol} = window.location;

        return (
            <div className="list-item">
                <div className="row list-item__top">
                    <div className="row list-item-intro">
                        <img
                            src={`${protocol}//${hostname}:3001/images/${stock.id}.jpg`}
                            onError={(e) => {
                                e.target.src = `${protocol}//${hostname}:3001/images/question.jpg`;
                            }}
                            className="round-img stocks__stock__img"
                            alt="company logo"
                        />
                        <p className="list-item__heading">{stock.name}</p>
                    </div>
                </div>

                {loading && <div>Загрузка данных...</div>}
                {error && <div>Ошибка: {error}</div>}

                <HistoricalData
                    historicalData={historicalData}
                />
            </div>
        )
    }
}

export default Stock;