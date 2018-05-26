import { error, loading } from './constants';

const apiErrorHandler = (() => {
    const init = (reason: any): void => {
        const errorMessage:string = 'Excuses, er is iets misgegaan met ons systeem. Probeer het later nog eens.';
        loading.classList.add('hide');
        error.textContent = errorMessage;
        console.error('--- API response failed. ---');
        console.log('Reason: ', reason);
    };

    return {
        init: init
    }
})();

export default apiErrorHandler;