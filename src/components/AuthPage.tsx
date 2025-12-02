import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export const AuthPage = ({ type }: { type: 'login' | 'register' }) => {
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (type === 'login') await login(email, pass);
            else await register(email, pass, name);
            navigate('/');
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4">
            <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl">
                <h2 className="text-3xl font-black text-white italic text-center mb-8">
                    {type === 'login' ? 'LOGIN' : 'CRIAR CONTA'}
                </h2>
                {error && <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm text-center">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {type === 'register' && (
                        <div>
                            <label htmlFor="name-input" className="block text-xs font-bold text-gray-400 uppercase mb-1">Nome</label>
                            <input id="name-input" required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-900 border border-slate-600 text-white p-3 rounded focus:border-fortnite-blue outline-none transition-colors" />
                        </div>
                    )}
                    <div>
                        <label htmlFor="email-input" className="block text-xs font-bold text-gray-400 uppercase mb-1">E-mail</label>
                        <input id="email-input" required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-600 text-white p-3 rounded focus:border-fortnite-blue outline-none transition-colors" />
                    </div>
                    <div>
                        <label htmlFor="password-input" className="block text-xs font-bold text-gray-400 uppercase mb-1">Senha</label>
                        <input id="password-input" required type="password" value={pass} onChange={e => setPass(e.target.value)} className="w-full bg-slate-900 border border-slate-600 text-white p-3 rounded focus:border-fortnite-blue outline-none transition-colors" />
                    </div>
                    <button type="submit" className="w-full bg-fortnite-yellow hover:bg-yellow-400 text-black font-black uppercase py-3 rounded shadow-lg hover:shadow-yellow-500/50 transition-all transform hover:-translate-y-0.5">
                        {type === 'login' ? 'Entrar' : 'Cadastrar e Ganhar 10.000 V-Bucks'}
                    </button>
                </form>
                <div className="mt-6 text-center">
                    {type === 'login' ? (
                        <Link to="/register" className="text-fortnite-blue hover:text-white text-sm font-bold">Não tem conta? Cadastre-se</Link>
                    ) : (
                        <Link to="/login" className="text-fortnite-blue hover:text-white text-sm font-bold">Já tem conta? Faça login</Link>
                    )}
                </div>
            </div>
        </div>
    );
};