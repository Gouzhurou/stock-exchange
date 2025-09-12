import React, { useState, useEffect } from "react";
import Stock from "./Stock";

function Stocks() {
    const [stocks, setStocks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStocks();
    }, []);

    const fetchStocks = async () => {
        try {
            setIsLoading(true);
            const {hostname, protocol} = window.location;
            const response = await fetch(`${protocol}//${hostname}:3001/stocks`);

            const data = await response.json();
            setStocks(data.stocks || []);
        } catch (error) {
            setError(error.message);
            console.error('Error loading stocks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="main center">Загрузка акций...</div>;
    }

    if (error) {
        return <div className="main center">Ошибка: {error}</div>;
    }

    return (
        <div className="main center">
            <div className="list">
                {stocks.map(stock => (
                    <Stock
                        key={stock.id}
                        stock={stock}
                    />
                ))}
            </div>
        </div>
    );
}

export default Stocks;
