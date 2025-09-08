import "../App.css"
import React from "react";
import {Link} from "react-router-dom";

function Header() {
    return (
        <header className="header center">
            <div className="row logo">
                <img src={`${process.env.PUBLIC_URL}/cheese.png`} className="logo__img" alt="logo_image"/>
                <p className="logo__text">БАНК</p>
            </div>

            <nav className="row nav">
                <div className="link-container">
                    <Link to="/brokers" className="link">Брокеры</Link>
                </div>
                <div className="link-container">
                    <Link to="/stocks" className="link">Акции</Link>
                </div>
                <div className="link-container">
                    <Link to="/settings" className="link">Настройки</Link>
                </div>
            </nav>
        </header>
    );
}

export default Header;
