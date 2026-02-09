import React, { useEffect, useState } from 'react';
import PasswordGenerator from './PasswordGenerator';
import { PencilSquareIcon, TrashIcon, EyeIcon, EyeSlashIcon, PlusIcon } from '@heroicons/react/24/outline';

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
    const [filteredCredentials, setFilteredCredentials] = useState<Credential[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [editingId, setEditingId] = useState<number | null>(null);
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
                setFilteredCredentials(data);
            }
        } catch (error) {
            console.error('Failed to fetch', error);
        }
    };

    useEffect(() => {
        fetchCredentials();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredCredentials(credentials);
        } else {
            const lower = searchTerm.toLowerCase();
            setFilteredCredentials(credentials.filter(c =>
                c.serviceName.toLowerCase().includes(lower) ||
                c.login.toLowerCase().includes(lower)
            ));
        }
    }, [searchTerm, credentials]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        const url = editingId
            ? `http://localhost:3001/passwords/${editingId}`
            : 'http://localhost:3001/passwords';

        const method = editingId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceName,
                    login,
                    password: password || undefined, // Send undefined if empty during edit to keep existing
                    masterPassword
                })
            });

            if (res.ok) {
                setShowForm(false);
                setEditingId(null);
                setServiceName('');
                setLogin('');
                setPassword('');
                fetchCredentials();
            }
        } catch (error) {
            alert('Failed to save');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this credential?')) return;

        try {
            const res = await fetch(`http://localhost:3001/passwords/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ masterPassword })
            });

            if (res.ok) {
                fetchCredentials();
            }
        } catch (error) {
            alert('Failed to delete');
        }
    };

    const handleEdit = async (cred: Credential) => {
        setEditingId(cred.id);
        setServiceName(cred.serviceName);
        setLogin(cred.login);
        setPassword(''); // Don't pre-fill password for security/simplicity
        setShowForm(true);
    };

    const handleReveal = async (id: number) => {
        if (decryptedPasswords[id]) {
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

    const openAdd = () => {
        setEditingId(null);
        setServiceName('');
        setLogin('');
        setPassword('');
        setShowForm(true);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans">
            <header className="flex justify-between items-center mb-8 bg-slate-800/50 p-4 rounded-xl backdrop-blur-md border border-slate-700/50 shadow-lg">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                    Vault Manager
                </h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-400">Locked with Argon2</span>
                    <button onClick={onLogout} className="text-slate-400 hover:text-white transition-colors">Logout</button>
                </div>
            </header>

            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Search vaults..."
                        className="w-full bg-slate-800/80 border border-slate-700 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg shadow-blue-900/20 hover:scale-105"
                >
                    <PlusIcon className="w-5 h-5" /> Add Password
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-800 p-6 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-700 animate-fade-in">
                        <h2 className="text-xl font-bold mb-6 text-white">{editingId ? 'Edit Credential' : 'Add Credential'}</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Service</label>
                                    <input
                                        placeholder="e.g. Netflix"
                                        className="w-full p-3 bg-slate-900/50 rounded-lg border border-slate-700 focus:border-blue-500 focus:outline-none transition-colors"
                                        value={serviceName} onChange={e => setServiceName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Login</label>
                                    <input
                                        placeholder="username or email"
                                        className="w-full p-3 bg-slate-900/50 rounded-lg border border-slate-700 focus:border-blue-500 focus:outline-none transition-colors"
                                        value={login} onChange={e => setLogin(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Password {editingId && '(Leave blank to keep current)'}</label>
                                <input
                                    type="text" // Show as text so generator is visible? Or toggle? Let's use text for better ux in generator context
                                    placeholder="Secure Password"
                                    className="w-full p-3 bg-slate-900/50 rounded-lg border border-slate-700 focus:border-blue-500 focus:outline-none font-mono text-green-400"
                                    value={password} onChange={e => setPassword(e.target.value)}
                                />
                            </div>

                            <PasswordGenerator onSelect={setPassword} />

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">Cancel</button>
                                <button type="submit" className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg text-white font-bold shadow-lg shadow-blue-900/30 transition-all hover:scale-105">
                                    {editingId ? 'Update Vault' : 'Save to Vault'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCredentials.map(cred => (
                    <div key={cred.id} className="bg-slate-800/40 backdrop-blur-sm p-5 rounded-xl border border-slate-700/50 shadow-xl hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-1 group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">{cred.serviceName}</h3>
                                <p className="text-slate-400 text-sm">{cred.login}</p>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(cred)} className="p-1 text-slate-400 hover:text-white" title="Edit">
                                    <PencilSquareIcon className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleDelete(cred.id)} className="p-1 text-slate-400 hover:text-red-400" title="Delete">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="bg-slate-900/80 p-3 rounded-lg mb-3 flex justify-between items-center border border-slate-700/30">
                            <code className="font-mono text-sm text-green-400 truncate mr-2">
                                {decryptedPasswords[cred.id] ? decryptedPasswords[cred.id] : '••••••••••••••••'}
                            </code>
                            <button
                                onClick={() => handleReveal(cred.id)}
                                className="text-slate-500 hover:text-blue-400 transition-colors"
                            >
                                {decryptedPasswords[cred.id] ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                        </div>

                        <div className="text-right">
                            <span className="text-slate-600 text-xs">Added {new Date(cred.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>

            {filteredCredentials.length === 0 && (
                <div className="text-center text-slate-500 mt-20">
                    <p className="text-lg">No passwords found.</p>
                    <p className="text-sm">Create one or adjust your search.</p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
