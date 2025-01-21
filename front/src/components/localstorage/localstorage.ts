// fonctions pour interagir avec le localstorage

export const saveTokenAndPseudoInLocalStorage = (pseudo: string, token: string,  state : string, start : boolean ) => {
    localStorage.setItem("pseudo", pseudo);
    localStorage.setItem("token", token);
    localStorage.setItem("state", state);
    localStorage.setItem("start", JSON.stringify(start));
}

export const removePseudoAndTokenFromLocalStorage = () => {
    localStorage.removeItem("pseudo");
    localStorage.removeItem("token");
    localStorage.removeItem("state");
    localStorage.removeItem("start");
}