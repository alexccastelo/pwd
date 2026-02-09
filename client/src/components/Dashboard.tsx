import React, { useEffect, useState } from 'react';
import PasswordGenerator from './PasswordGenerator';

interface DashboardProps {
    masterPassword: string;
    onLogout: () => void;
}

interface Credential {
    id: number;
    serviceName: string;
    login: string;
    createdAt: string;
}

const Dashboard: React.FC<DashboardProps> = ({ masterPassword, onLogout }) => {
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);

    // Form State
    const [serviceName, setServiceName] = useState('');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');

    const [decryptedPasswords, setDecryptedPasswords] = useState<Record<number, string>>({});

    const fetchCredentials = async () => {
        try {
            const res = await fetch('http://localhost:3001/passwords');
            if (res.ok) {
                const data = await res.json();
                setCredentials(data);
            }
        } catch (error) {
            console.error('Failed to fetch', error);
        }
    };

    useEffect(() => {
        fetchCredentials();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3001/passwords', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceName,
                    login,
                    password,
                    masterPassword
                })
            });
            if (res.ok) {
                setShowAddForm(false);
                setServiceName('');
                setLogin('');
                setPassword('');
                fetchCredentials();
            }
        } catch (error) {
            alert('Failed to save');
        }
    };

    const handleReveal = async (id: number) => {
        if (decryptedPasswords[id]) {
            // Toggle off?
            const newDecrypted = { ...decryptedPasswords };
            delete newDecrypted[id];
            setDecryptedPasswords(newDecrypted);
            return;
        }

        try {
            const res = await fetch('http://localhost:3001/passwords/decrypt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, masterPassword })
            });
            if (res.ok) {
                const data = await res.json();
                setDecryptedPasswords(prev => ({ ...prev, [id]: data.password }));
            }
        } catch (error) {
            alert('Failed to decrypt');
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">My Passwords</h1>
                <button onClick={onLogout} className="text-gray-400 hover:text-white">Logout</button>
            </header>

            <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="mb-6 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
                {showAddForm ? 'Cancel' : '+ Add Password'}
            </button>

            {showAddForm && (
                <div className="bg-gray-800 p-6 rounded-lg mb-8 border border-gray-700">
                    <h2 className="text-xl mb-4">Add New Credential</h2>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                placeholder="Service Name (e.g. Google)"
                                className="p-2 bg-gray-700 rounded text-white"
                                value={serviceName} onChange={e => setServiceName(e.target.value)}
                            />
                            <input
                                placeholder="Login/Email"
                                className="p-2 bg-gray-700 rounded text-white"
                                value={login} onChange={e => setLogin(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="password"
                                placeholder="Password"
                                className="p-2 bg-gray-700 rounded text-white"
                                value={password} onChange={e => setPassword(e.target.value)}
                            />
                            <div className="text-sm text-gray-400 self-center">
                                Or generate one below:
                            </div>
                        </div>

                        <PasswordGenerator onSelect={setPassword} />

                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-white font-bold">
                            Save
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {credentials.map(cred => (
                    <div key={cred.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold text-lg text-blue-400">{cred.serviceName}</h3>
                            <p className="text-gray-400 text-sm mb-2">{cred.login}</p>
                            <div className="bg-gray-900 p-2 rounded mb-2 font-mono text-sm break-all h-10 flex items-center">
                                {decryptedPasswords[cred.id] ? decryptedPasswords[cred.id] : '••••••••••••'}
                            </div>
                        </div>
                        <div className="flex justify-between text-sm mt-2">
                            <span className="text-gray-500 text-xs">{new Date(cred.createdAt).toLocaleDateString()}</span>
                            <button
                                onClick={() => handleReveal(cred.id)}
                                className="text-blue-400 hover:underline"
                            >
                                {decryptedPasswords[cred.id] ? 'Hide' : 'Reveal'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
