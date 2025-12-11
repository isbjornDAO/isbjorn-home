import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRightIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface Transaction {
  id: string;
  time: string;
  txHash: string;
  iata: string;
  destination: string;
  amount: string;
  gate: string;
  status: 'ON TIME' | 'CONFIRMED' | 'PENDING' | 'BOARDING' | 'DEPARTED';
}

const TransactionBoard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      time: '00:05',
      txHash: 'TX7A2F',
      iata: 'WWF',
      destination: 'WILDLIFE FUND',
      amount: '$250',
      gate: 'B12',
      status: 'CONFIRMED'
    },
    {
      id: '2',
      time: '00:12',
      txHash: 'TX8B9C',
      iata: 'GRN',
      destination: 'GREENPEACE',
      amount: '$100',
      gate: 'A5',
      status: 'CONFIRMED'
    },
    {
      id: '3',
      time: '00:28',
      txHash: 'TX3D4E',
      iata: 'OCC',
      destination: 'OCEAN CONSERVANCY',
      amount: '$500',
      gate: 'C8',
      status: 'BOARDING'
    },
    {
      id: '4',
      time: '00:45',
      txHash: 'TX9F1G',
      iata: 'NRC',
      destination: 'NATURE CONSERVANCY',
      amount: '$75',
      gate: 'A12',
      status: 'ON TIME'
    },
    {
      id: '5',
      time: '01:10',
      txHash: 'TX2H3J',
      iata: 'EDF',
      destination: 'ENVIRONMENTAL DEFENSE',
      amount: '$1000',
      gate: 'D4',
      status: 'ON TIME'
    },
    {
      id: '6',
      time: '01:23',
      txHash: 'TX4K5L',
      iata: 'RFA',
      destination: 'RAINFOREST ALLIANCE',
      amount: '$150',
      gate: 'B7',
      status: 'ON TIME'
    },
    {
      id: '7',
      time: '02:05',
      txHash: 'TX6M7N',
      iata: 'CIN',
      destination: 'CONSERVATION INTL',
      amount: '$300',
      gate: 'A9',
      status: 'PENDING'
    },
    {
      id: '8',
      time: '02:34',
      txHash: 'TX8P9Q',
      iata: '350',
      destination: '350.ORG CLIMATE',
      amount: '$200',
      gate: 'C2',
      status: 'ON TIME'
    },
    {
      id: '9',
      time: '03:15',
      txHash: 'TX1R2S',
      iata: 'SCL',
      destination: 'SIERRA CLUB',
      amount: '$425',
      gate: 'B15',
      status: 'ON TIME'
    },
    {
      id: '10',
      time: '03:42',
      txHash: 'TX3T4U',
      iata: 'FOE',
      destination: 'FRIENDS OF EARTH',
      amount: '$180',
      gate: 'A3',
      status: 'ON TIME'
    },
    {
      id: '11',
      time: '04:01',
      txHash: 'TX5V6W',
      iata: 'GZR',
      destination: 'GENERATION ZERO NZ',
      amount: '$90',
      gate: 'D1',
      status: 'ON TIME'
    },
    {
      id: '12',
      time: '04:28',
      txHash: 'TX7X8Y',
      iata: 'NRD',
      destination: 'NRDC ACTION FUND',
      amount: '$650',
      gate: 'C11',
      status: 'ON TIME'
    }
  ]);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTransactions(prev => {
        const newTx: Transaction = {
          id: Date.now().toString(),
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          txHash: `TX${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          iata: ['WWF', 'GRN', 'OCC', 'NRC', 'EDF', 'RFA', 'CIN', '350', 'SCL', 'FOE'][Math.floor(Math.random() * 10)],
          destination: ['WILDLIFE FUND', 'GREENPEACE', 'OCEAN CONSERVANCY', 'NATURE CONSERVANCY', 'ENVIRONMENTAL DEFENSE', 'RAINFOREST ALLIANCE', 'CONSERVATION INTL', '350.ORG CLIMATE', 'SIERRA CLUB', 'FRIENDS OF EARTH'][Math.floor(Math.random() * 10)],
          amount: `$${Math.floor(Math.random() * 900 + 100)}`,
          gate: `${['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)]}${Math.floor(Math.random() * 15 + 1)}`,
          status: 'PENDING'
        };

        // Keep only last 12 transactions
        const updated = [newTx, ...prev.slice(0, 11)];
        return updated;
      });
    }, 15000); // New transaction every 15 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#0a1628] text-white font-mono p-8 rounded-xl overflow-hidden min-h-[600px]">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <PaperAirplaneIcon className="w-8 h-8 text-white" />
        <h1 className="text-4xl font-light tracking-wide text-white">Transactions</h1>
        <ArrowUpRightIcon className="w-8 h-8 text-white" />
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-[80px_100px_80px_1fr_100px_80px_120px] gap-4 pb-3 border-b border-gray-800 mb-4">
        <div className="text-gray-500 text-sm">Time</div>
        <div className="text-gray-500 text-sm">TX Hash</div>
        <div className="text-gray-500 text-sm">Code</div>
        <div className="text-gray-500 text-sm">To</div>
        <div className="text-gray-500 text-sm">Amount</div>
        <div className="text-gray-500 text-sm">Block</div>
        <div className="text-gray-500 text-sm">Status</div>
      </div>

      {/* Transaction Rows */}
      <AnimatePresence mode="popLayout">
        {transactions.map((tx, idx) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className={`grid grid-cols-[80px_100px_80px_1fr_100px_80px_120px] gap-4 py-3 border-b border-gray-900 hover:bg-gray-900/30 transition-colors ${
              tx.status === 'PENDING' ? 'animate-pulse' : ''
            }`}
          >
            {/* Time */}
            <div className="text-lg">
              {tx.time}
            </div>

            {/* TX Hash */}
            <div className="text-gray-300 text-sm font-mono">
              {tx.txHash}
            </div>

            {/* IATA Code (highlighted in yellow like airports) */}
            <div className="text-yellow-400 font-bold tracking-wider">
              {tx.iata}
            </div>

            {/* Destination */}
            <div className="text-gray-100 tracking-wide">
              {tx.destination}
            </div>

            {/* Amount */}
            <div className="font-bold text-green-400">
              {tx.amount}
            </div>

            {/* Block/Gate */}
            <div className="text-gray-300">
              {tx.gate}
            </div>

            {/* Status */}
            <div className={`font-medium ${
              tx.status === 'CONFIRMED' ? 'text-green-400' :
              tx.status === 'BOARDING' ? 'text-blue-400' :
              tx.status === 'PENDING' ? 'text-yellow-400' :
              tx.status === 'DEPARTED' ? 'text-gray-500' :
              'text-gray-300'
            }`}>
              {tx.status}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-800">
        <p className="text-gray-600 text-sm">
          For detailed information please visit your blockchain explorer
          <br />
          or check the transaction hash on Avalanche C-Chain
        </p>
      </div>
    </div>
  );
};

export default TransactionBoard;
