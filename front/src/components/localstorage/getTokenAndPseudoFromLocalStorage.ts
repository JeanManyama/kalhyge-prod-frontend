
export const getTokenAndPseudoFromLocalStorage = () => {
    const pseudo = localStorage.getItem('pseudo');
    const token = localStorage.getItem('token');
    const state = localStorage.getItem('state');
    const start = localStorage.getItem('start');





    return { pseudo, token, state, start };
};
