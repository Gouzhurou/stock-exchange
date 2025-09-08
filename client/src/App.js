import React from 'react';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Brokers from "./components/Brokers";
import Stocks from "./components/Stocks";
import Settings from "./components/Settings";
import Header from "./components/Header";

function App() {
    return (
        <BrowserRouter>
            <Header/>
            <Routes>
                <Route path="/" element={<Brokers/>}/>
                <Route path="/brokers" element={<Brokers/>}/>
                <Route path="/stocks" element={<Stocks/>}/>
                <Route path="/settings" element={<Settings/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
