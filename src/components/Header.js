import logo from "../images/header-logo.svg";
import React from "react";
import {Link, Switch, Route} from "react-router-dom";

function Header() {

    return (
        <header className="header">
            <img alt="Логотип" className="header__logo" src={logo}/>
            <Switch>
                <Route path="/register">
                    <Link to="/login">Войти</Link>
                </Route>
                <Route path="/login">
                    <Link to="/register">Регистрация</Link>
                </Route>
            </Switch>
        </header>
    );
}

export default Header;