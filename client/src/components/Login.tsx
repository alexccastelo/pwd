import React, { useState } from 'react';

interface LoginProps {
    onLogin: (password: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [needsSetup, setNeedsSetup] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (needsSetup && password !== confirm) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        const endpoint = needsSetup ? '/auth/init' : '/auth/login';

        try {
            const response = await fetch(`${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            if (response.ok) {
                if (needsSetup) {
                    alert('System initialized! Please log in.');
                    setNeedsSetup(false);
                    setPassword('');
                    setConfirm('');
                } else {
                    onLogin(password);
                }
            } else {
                if (response.status === 404 && !needsSetup) {
                    setNeedsSetup(true);
                    setError('System not initialized. Please create a Master Password below.');
                    // Clear password field to avoid confusion or keep it? Keep it for convenience if they want to use it.
                } else {
                    const data = await response.json();
                    setError(data.error || 'Authentication failed');
                }
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="p-8 bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <h1 className="text-3xl font-bold mb-6 text-center text-blue-500">
                    {needsSetup ? 'Setup Master Password' : 'Secure Password Manager'}
                </h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            {needsSetup ? 'Create Master Password' : 'Master Password'}
                        </label>
                        <input
                            type="password"
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={needsSetup ? "At least 8 characters" : "Enter your master password"}
                            minLength={8}
                        />
                    </div>

                    {needsSetup && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Confirm Password</label>
                            <input
                                type="password"
                                className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                placeholder="Repeat password"
                            />
                        </div>
                    )}

                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full font-bold py-2 px-4 rounded transition duration-200 ${needsSetup ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {loading ? 'Processing...' : (needsSetup ? 'Initialize System' : 'Unlock')}
                    </button>

                    {!needsSetup && (
                        <p className="text-xs text-center text-gray-500 mt-4">
                            First time? Try logging in to trigger setup.
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Login;
