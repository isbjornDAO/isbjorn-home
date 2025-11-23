import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface CompanySearchResult {
    name: string;
    companyNumber: string;
    status: string;
}

interface CompanySearchProps {
    onSelect: (company: { name: string; number: string }) => void;
    initialValue?: string;
    placeholder?: string;
    className?: string;
}

const CompanySearch: React.FC<CompanySearchProps> = ({
    onSelect,
    initialValue = '',
    placeholder = 'Search for your company...',
    className = ''
}) => {
    const [query, setQuery] = useState(initialValue);
    const [results, setResults] = useState<CompanySearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const searchCompanies = async () => {
            if (query.length < 2) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/companies/search`, {
                    params: { q: query }
                });
                if (response.data.success) {
                    setResults(response.data.data);
                    setIsOpen(true);
                }
            } catch (error) {
                console.error('Company search failed:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const debounceTimer = setTimeout(searchCompanies, 300);
        return () => clearTimeout(debounceTimer);
    }, [query]);

    const handleSelect = (company: CompanySearchResult) => {
        setQuery(company.name);
        setIsOpen(false);
        onSelect({ name: company.name, number: company.companyNumber });
    };

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arctic-500 focus:border-transparent outline-none transition-all"
                />
                {isLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="animate-spin h-4 w-4 border-2 border-arctic-500 border-t-transparent rounded-full"></div>
                    </div>
                )}
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {results.map((company) => (
                        <button
                            key={company.companyNumber}
                            onClick={() => handleSelect(company)}
                            className="w-full text-left px-4 py-3 hover:bg-ice-50 transition-colors border-b border-gray-100 last:border-0"
                        >
                            <div className="font-medium text-gray-900">{company.name}</div>
                            <div className="text-xs text-gray-500 flex justify-between mt-1">
                                <span>NZBN: {company.companyNumber}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] ${company.status === 'Registered' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {company.status}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {isOpen && results.length === 0 && query.length >= 2 && !isLoading && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500 text-sm">
                    No companies found
                </div>
            )}
        </div>
    );
};

export default CompanySearch;
