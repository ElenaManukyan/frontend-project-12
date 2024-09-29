import React, { useState } from 'react';  
import { useNavigate } from 'react-router-dom';
import { addUsername } from './store/authSlice';
import { useDispatch } from 'react-redux';
import axios from 'axios';

const LoginForm = () => {
    const [username, setUsername] = useState('');  
    const [password, setPassword] = useState('');  
    const [error, setError] = useState('');  
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {  
        e.preventDefault();   
        try {  
            const response = await axios.post('/api/v1/login', { username, password }); 
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('username', response.data.username);
            // console.log(`Login.js response.data.username= ${response.data.username}`);
            // dispatch(addUsername(response.data.username));
            navigate('/');
        } catch (err) {
            // console.log(`err= ${JSON.stringify(err, null, 2)}`);
            const status = err.response ? err.response.status : null;
            switch (status) {
                case 401:
                    setError('Проблема с авторизацией: неправильный логин/пароль');
                    break;
                default:
                    setError(err.response?.data?.message || err.message);
            } 
        }  
    };  

    return (  
        <form onSubmit={handleSubmit}>  
            <h2>Вход</h2>  
            {error && <p style={{ color: 'red' }}>{error}</p>}  
            <div>  
                <label>  
                    Username:  
                    <input  
                        type="text"  
                        value={username}  
                        onChange={(e) => setUsername(e.target.value)}  
                        required  
                    />  
                </label>  
            </div>  
            <div>  
                <label>  
                    Пароль:  
                    <input  
                        type="password"  
                        value={password}  
                        onChange={(e) => setPassword(e.target.value)}  
                        required  
                    />  
                </label>  
            </div>  
            <button type="submit">Войти</button>  
        </form>  
    );  
};  

export default LoginForm;