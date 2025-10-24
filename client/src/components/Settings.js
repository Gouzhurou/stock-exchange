import React, {useEffect, useState} from "react";
import '../App.css'
import '../css/Settings.css'
import '../css/Input.css'
import StockListItem from "./StockListItem";

function Settings() {
    const [stocks, setStocks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [period, setPeriod] = useState("");
    const [isSimulationRunning, setIsSimulationRunning] = useState(false);

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
            console.errorMassage('Error loading stocks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateStock = async (id) => {
        if (isSimulationRunning) {
            return;
        }

        try {
            const {hostname, protocol} = window.location;
            await fetch(`${protocol}//${hostname}:3001/stocks/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            setStocks(prevStocks =>
                prevStocks.map(stock =>
                    stock.id === id ? { ...stock, selected: !stock.selected } : stock
                )
            );
        } catch (error) {
            console.errorMassage('Error updating stock selected:', error);
        }
    }

    const handleDateChange = (e) => {
        if (isSimulationRunning)
            return;
        setStartDate(e.target.value);
    }

    const handlePeriodChange = (e) => {
        if (isSimulationRunning)
            return;
        setPeriod(e.target.value);
    }

    const startSimulation = () => {
        if (!startDate || !period || period < 1) {
            alert("Пожалуйста, введите корректные дату и период");
            return;
        }

        const hasSelectedStocks = stocks.some(stock => stock.selected);

        if (!hasSelectedStocks) {
            alert("Пожалуйста, выберите хотя бы одну акцию для симуляции");
            return;
        }

        setIsSimulationRunning(true);
    }

    const endSimulation = () => {
        setIsSimulationRunning(false);
    }

    if (isLoading) {
        return <div className="main center">Загрузка акций...</div>;
    }

    if (error) {
        return <div className="main center">Ошибка: {error}</div>;
    }

    return (
        <div className="main center">
            <div className="input-block">
                <div className="input-container">
                    <p className="input-text">Дата</p>
                    <input
                        className="input settings__input"
                        type="date"
                        placeholder="Date"
                        value={startDate}
                        onChange={handleDateChange}
                    />
                </div>
                <div className="input-container">
                    <p className="input-text">Период</p>
                    <input
                        className="input settings__input"
                        type="number"
                        placeholder="Period (days per seconds)"
                        value={period}
                        onChange={handlePeriodChange}
                    />
                </div>
                <div className="settings__buttons">
                    <button className="button" onClick={startSimulation}>Начать</button>
                    <button className="button" onClick={endSimulation}>Завершить</button>
                </div>
            </div>

            <div className="block">
                <div className="headings">
                    <p className="table__heading">Название</p>
                    <p className="table__heading">Цена</p>
                    <p className="table__heading">За период</p>
                </div>

                <div className="list">
                    {stocks.map((stock) => (
                        <StockListItem
                            key={stock.id}
                            stock={stock}
                            date={startDate}
                            period={period}
                            isSimulationRunning={isSimulationRunning}
                            onUpdate={updateStock}
                            onSimulationEnd={endSimulation}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Settings;
