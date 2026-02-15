export const apiUrl = 'http://127.0.0.1:8000/api/';

export const token = () => {
    const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
    if (!userInfo) return null;

    const data = JSON.parse(userInfo);
    return data.token; // <- changed from data.user.token to data.token
}