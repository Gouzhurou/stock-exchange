import "../css/Brokers.css"
import React, { useState, useEffect } from "react";
import Broker from "./Broker";

function Brokers() {
    const [name, setName] = useState("");
    const [brokers, setBrokers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBrokers();
    }, []);

    const fetchBrokers = async () => {
        try {
            setIsLoading(true);
            const { hostname, protocol } = window.location;
            const response = await fetch(`${protocol}//${hostname}:3001/brokers`);

            const data = await response.json();
            setBrokers(data.brokers || []);
        } catch (error) {
            setError(error.message);
            console.error('Error loading brokers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const onChange = (e) => {
        setName(e.target.value);
    };

    const addBroker = async () => {
        if (name.trim() === "") return;

        const newBroker = {
            name: name
        };

        try {
            const {hostname, protocol} = window.location;
            await fetch(`${protocol}//${hostname}:3001/brokers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newBroker),
            });

            await fetchBrokers();
            setName("");
        } catch (error) {
            console.error('Error adding broker:', error);
        }
    };

    const updateBroker = async (updatedBroker) => {
        try {
            const {hostname, protocol} = window.location;
            await fetch(`${protocol}//${hostname}:3001/brokers/${updatedBroker.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedBroker),
            });

            await fetchBrokers();
        } catch (error) {
            console.error('Error updating broker:', error);
        }
    }

    const deleteBrokers = async () => {
        try {
            const {hostname, protocol} = window.location;
            await fetch(`${protocol}//${hostname}:3001/brokers`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            await fetchBrokers();
        } catch (error) {
            console.error('Error deleting brokers:', error);
        }
    }

    if (isLoading) {
        return <div className="main center">Загрузка брокеров...</div>;
    }

    if (error) {
        return <div className="main center">Ошибка: {error}</div>;
    }

    return (
        <div className="main center">
            <div className="add-block">
                <input
                    className="input add-input"
                    type="text"
                    placeholder="Broker"
                    value={name}
                    onChange={onChange}
                />
                <button className="button" onClick={addBroker}>Добавить</button>
            </div>

            <div className="block">
                <div className="row buttons">
                    <button id="delete-button" onClick={deleteBrokers}></button>
                </div>

                <div className="list">
                    {brokers.map(broker => (
                        <Broker
                            key={broker.id}
                            broker={broker}
                            onUpdate={updateBroker}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Brokers;
