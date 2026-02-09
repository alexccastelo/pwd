import React, { useState, useEffect } from 'react';

interface PasswordGeneratorProps {
    onSelect: (password: string) => void;
}

const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({ onSelect }) => {
    const [length, setLength] = useState(16);
    const [useUpper, setUseUpper] = useState(true);
    const [useLower, setUseLower] = useState(true);
    const [useNumbers, setUseNumbers] = useState(true);
    const [useSymbols, setUseSymbols] = useState(true);
    const [generated, setGenerated] = useState('');

    const generate = () => {
        let charset = '';
        if (useLower) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (useUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (useNumbers) charset += '0123456789';
        if (useSymbols) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

        if (charset === '') return;

        let pass = '';
        for (let i = 0; i < length; i++) {
            pass += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        setGenerated(pass);
        onSelect(pass);
    };

    useEffect(() => {
        generate();
    }, [length, useUpper, useLower, useNumbers, useSymbols]);

    return (
        <div className="p-4 bg-gray-700 rounded mb-4">
            <h3 className="text-lg font-semibold mb-2 text-white">Generator</h3>
            <div className="flex items-center space-x-2 mb-4">
                <input
                    type="text"
                    readOnly
                    value={generated}
                    className="flex-1 p-2 bg-gray-900 text-green-400 font-mono rounded"
                />
                <button onClick={generate} className="p-2 bg-gray-600 rounded hover:bg-gray-500">↻</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                <div>
                    <label className="block mb-1">Length: {length}</label>
                    <input
                        type="range"
                        min="8" max="64"
                        value={length}
                        onChange={(e) => setLength(Number(e.target.value))}
                        className="w-full"
                    />
                </div>
                <div className="flex flex-col space-y-1">
                    <label><input type="checkbox" checked={useUpper} onChange={(e) => setUseUpper(e.target.checked)} /> Uppercase</label>
                    <label><input type="checkbox" checked={useLower} onChange={(e) => setUseLower(e.target.checked)} /> Lowercase</label>
                    <label><input type="checkbox" checked={useNumbers} onChange={(e) => setUseNumbers(e.target.checked)} /> Numbers</label>
                    <label><input type="checkbox" checked={useSymbols} onChange={(e) => setUseSymbols(e.target.checked)} /> Symbols</label>
                </div>
            </div>
        </div>
    );
};

export default PasswordGenerator;
