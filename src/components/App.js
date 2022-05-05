import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import Main from "./Main";
import PopupWithForm from "./PopupWithForm";
import ImagePopup from "./ImagePopup";
import api from "../utils/Api";
import CurrentUserContext from "../contexts/CurrentUserContext";
import EditProfilePopup from "./EditProfilePopup";
import EditAvatarPopup from "./EditAvatarPopup";
import AddPlacePopup from "./AddPlacePopup";
import {Redirect, Switch, Route, useHistory} from "react-router-dom";
import * as auth from "../utils/auth";
import Login from "./Login";
import Register from "./Register";
import ProtectedRoute from "./ProtectedRoute";

function App() {
    const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = React.useState(false);
    const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = React.useState(false);
    const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
    const [isImagePopupOpen, setIsImagePopupOpen] = React.useState(false);
    const [selectedCard, setIsSelectedCard] = React.useState({});
    const [currentUser, setCurrentUser] = React.useState({});
    const [cards, putCards] = React.useState([]);
    const [isLoadingAllData, setIsLoadingAllData] = React.useState(false);
    const [isConfirmPopupOpen, setIsConfirmPopupOpen] = React.useState(false);
    const [cardForDelete, setCardForDelete] = React.useState({})
    const [loadingUserInfo, setLoadingUserInfo] = React.useState(false);
    const [loadingCards, setLoadingCards] = React.useState(false);
    const [loadingAvatar, setLoadingAvatar] = React.useState(false);
    const [loggedIn, setLoggedIn] = React.useState(false);
    const [userEmail, setUserEmail] = React.useState(null);
    const history = useHistory();

    React.useEffect(() => {
        tokenCheck();
    }, []);

    React.useEffect(() => {
        if (loggedIn) {
            history.push('/')
            return;
        }
        history.push('/register');
    }, [loggedIn]);

    const handleRegister = (email, password) => {
        auth.register(email, password)
            .then(() => {
                history.push("/login");
            })
            .catch((er) => {
                console.log(er)
            });
    }

    const handleLogin = (email, password) => {
        auth.authorize(email, password)
            .then((data) => {
                if (!data.jwt) {
                    return;
                }
                setLoggedIn(true);
                tokenCheck();
                localStorage.setItem('jwt', data.jwt);
               // history.push('/');
            });
    }

    const tokenCheck = () => {
        if (localStorage.getItem('jwt')){
            let jwt = localStorage.getItem('jwt');
            auth.getContent(jwt)
                .then((res) => {
                    if (res) {
                        setUserEmail(res.email);
                        console.log(res.email)
                        setLoggedIn(true);
                        //history.push('/');
                    }
                });
        }
    }

    const handleSignOut = () => {
        localStorage.removeItem('jwt');
        setLoggedIn(false);
    }

    const handleEditAvatarClick = () => {
        setIsEditAvatarPopupOpen(true);
    }

    const handleEditProfileClick = () => {
        setIsEditProfilePopupOpen(true);
    }

    const handleAddPlaceClick = () => {
        setIsAddPlacePopupOpen(true);
    }

    function handleCardClick(card) {
        setIsSelectedCard(card);
        setIsImagePopupOpen(true);
    }

    function handleCardDelete(card) {
        setCardForDelete(card);
        setIsConfirmPopupOpen(true);
    }

    const closeAllPopups = () => {
        setIsAddPlacePopupOpen(false);
        setIsEditAvatarPopupOpen(false);
        setIsEditProfilePopupOpen(false);
        setIsImagePopupOpen(false);
        setIsConfirmPopupOpen(false);
    }

    function handleCardLike(card) {
        const isLiked = card.likes.some(i => i._id === currentUser._id);

        api.changeLikeCardStatus(card._id, !isLiked).then((newCard) => {
            putCards((cards) => cards.map((c) => c._id === card._id ? newCard : c));
        });
    }

    React.useEffect(() => {
        setIsLoadingAllData(true);
        api.getAllData()
            .then((data) => {
                    const [userData, cardsData] = data;
                    putCards(cardsData);
                    setCurrentUser(userData);
                }
            ).catch(error => console.log(error))
            .finally(() => {
                setIsLoadingAllData(false);
            })
    }, []);

    function handleCardDeletePopup(evt) {
        evt.preventDefault();
        api.deleteCard(cardForDelete._id)
            .then(() => {
                    const newCards = cards.filter((el) => el !== cardForDelete);
                    putCards(newCards);
                    closeAllPopups();
                }
            ).catch(error => console.log(error));
    }

    function handleUpdateUser({name, about}) {
        setLoadingUserInfo(true);
        return api.editProfile({name, about})
            .then((res) => {
                setCurrentUser(res);
                setIsEditProfilePopupOpen(false);
            }).catch((error) => console.log(error))
            .finally(() => {
                setLoadingUserInfo(false)
            });
    }

    function handelUpdateAvatar(avatar) {
        setLoadingAvatar(true);
        return api.changeAvatar(avatar)
            .then((res) => {
                setIsEditAvatarPopupOpen(false)
                setCurrentUser(res);
            })
            .catch((error) => console.log(error))
            .finally(() => {
                setLoadingAvatar(false);
            });
    }

    function handleAddPlaceSubmit({name, link}) {
        setLoadingCards(true);
        return api.addCard({name, link})
            .then((newCard) => {
                putCards([newCard, ...cards]);
                setIsAddPlacePopupOpen(false);
            })
            .catch((error) => console.log(error))
            .finally(() => {
                setLoadingCards(false);
            });
    }

    return (
        <CurrentUserContext.Provider value={currentUser}>
            <div>
                <div className="page">
                    <Header/>
                    <Switch>
                        <ProtectedRoute exact path="/" loggedIn={loggedIn}>
                            <Main  onEditProfile={handleEditProfileClick}
                                   onAddPlace={handleAddPlaceClick}
                                   onEditAvatar={handleEditAvatarClick}
                                   onCardClick={handleCardClick}
                                   cards={cards}
                                   onCardLike={handleCardLike}
                                   isLoadingAllData={isLoadingAllData}
                                   onCardDelete={handleCardDelete}/>
                        </ProtectedRoute>
                        <Route exact path="/login">
                            <Login handleLogin={handleLogin} tokenCheck={tokenCheck}/>
                        </Route>
                        <Route exact path="/register">
                            <Register handleRegister={handleRegister}/>
                        </Route>
                        <Route>
                            {loggedIn ? <Redirect to="/" /> : <Redirect to="/login"/> }
                        </Route>
                    </Switch>
                    <Footer/>
                </div>
                <EditProfilePopup isOpen={isEditProfilePopupOpen}
                                  onClose={closeAllPopups}
                                  isLoadingAllData={isLoadingAllData}
                                  currentUser={currentUser}
                                  onUpdateUser={handleUpdateUser}
                                  loadingInfo={loadingUserInfo}/>
                <EditAvatarPopup isOpen={isEditAvatarPopupOpen}
                                 onClose={closeAllPopups}
                                 openEditAvatar={handleEditAvatarClick}
                                 onUpdateAvatar={handelUpdateAvatar}
                                 loadingInfo={loadingAvatar}/>
                <AddPlacePopup isOpen={isAddPlacePopupOpen}
                               onClose={closeAllPopups}
                               onAddPlace={handleAddPlaceSubmit}
                               loadingInfo={loadingCards}/>
                <PopupWithForm name="delete-card" title="Вы уверены?" button="Да"
                               onClose={closeAllPopups}
                               isOpen={isConfirmPopupOpen}
                               onSubmit={handleCardDeletePopup}
                />
                <ImagePopup name="photo"
                            onClose={closeAllPopups}
                            isOpen={isImagePopupOpen}
                            card={selectedCard}/>
            </div>
        </CurrentUserContext.Provider>
    );
}

export default App;
