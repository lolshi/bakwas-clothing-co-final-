import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

const TABS = [
  { key: 'wallets', label: 'Wallets' },
  { key: 'transactions', label: 'All Transactions' },
];

const AdminWallets = () => {
  const [activeTab, setActiveTab] = useState<'wallets' | 'transactions'>('wallets');
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showTransactions, setShowTransactions] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<any | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [allTransactionsLoading, setAllTransactionsLoading] = useState(false);
  const [allTransactionsError, setAllTransactionsError] = useState<string | null>(null);

  useEffect(() => {
    fetchWallets();
  }, []);

  useEffect(() => {
    if (activeTab === 'transactions') {
      fetchAllTransactions();
    }
  }, [activeTab]);

  const fetchWallets = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch all wallets
      const { data: walletsData, error: walletsError } = await supabase
        .from('user_wallets')
        .select('*');
      if (walletsError) throw walletsError;
      if (!walletsData || walletsData.length === 0) {
        setWallets([]);
        setLoading(false);
        return;
      }
      // 2. Get unique user_ids
      const userIds = Array.from(new Set(walletsData.map(w => w.user_id).filter(Boolean)));
      // 3. Fetch emails from public.user_emails
      const { data: emailsData, error: emailsError } = await supabase
        .from('user_emails')
        .select('user_id, email')
        .in('user_id', userIds);
      if (emailsError) throw emailsError;
      const emailMap = Object.fromEntries((emailsData || []).map((u: any) => [u.user_id, u.email]));
      const walletsWithEmail = walletsData.map(w => ({
        ...w,
        email: emailMap[w.user_id] || 'N/A',
      }));
      setWallets(walletsWithEmail);
    } catch (err) {
      setError('Failed to fetch wallet data.');
      setWallets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTransactions = async () => {
    setAllTransactionsLoading(true);
    setAllTransactionsError(null);
    try {
      // 1. Fetch all transactions
      const { data: txData, error: txError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .order('created_at', { ascending: false });
      if (txError) throw txError;
      if (!txData || txData.length === 0) {
        setAllTransactions([]);
        setAllTransactionsLoading(false);
        return;
      }
      // 2. Get unique user_ids
      const userIds = Array.from(new Set(txData.map(t => t.user_id).filter(Boolean)));
      // 3. Fetch emails from public.user_emails
      const { data: emailsData, error: emailsError } = await supabase
        .from('user_emails')
        .select('user_id, email')
        .in('user_id', userIds);
      if (emailsError) throw emailsError;
      const emailMap = Object.fromEntries((emailsData || []).map((u: any) => [u.user_id, u.email]));
      const txWithEmail = txData.map(t => ({
        ...t,
        email: emailMap[t.user_id] || 'N/A',
      }));
      setAllTransactions(txWithEmail);
    } catch (err) {
      setAllTransactionsError('Failed to fetch transactions.');
      setAllTransactions([]);
    } finally {
      setAllTransactionsLoading(false);
    }
  };

  const fetchTransactions = async (userId: string) => {
    setTransactionsLoading(true);
    setTransactionsError(null);
    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      setTransactionsError('Failed to fetch transactions.');
      setTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handleViewTransactions = (wallet: any) => {
    setSelectedWallet(wallet);
    setShowTransactions(true);
    fetchTransactions(wallet.user_id);
  };

  const filteredWallets = wallets.filter(wallet => 
    wallet.user_id?.toLowerCase().includes(search.toLowerCase()) ||
    wallet.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Wallet Management</h1>
        {/* Tab Navigation */}
        <div className="flex gap-4 border-b mb-4">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`px-4 py-2 font-semibold border-b-2 transition-colors ${activeTab === tab.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-600'}`}
              onClick={() => setActiveTab(tab.key as 'wallets' | 'transactions')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Wallets Tab */}
        {activeTab === 'wallets' && (
          <>
            <div className="flex justify-between items-center">
              <Input
                placeholder="Search by user ID or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Card>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : error ? (
                  <div className="text-center py-4 text-red-500">{error}</div>
                ) : filteredWallets.length === 0 ? (
                  <div className="text-center py-4">No wallets found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">User ID</th>
                          <th className="text-left p-2">Email</th>
                          <th className="text-left p-2">Balance</th>
                          <th className="text-left p-2">Last Updated</th>
                          <th className="text-left p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredWallets.map((wallet) => (
                          <tr key={wallet.id} className="border-b">
                            <td className="p-2">{wallet.user_id}</td>
                            <td className="p-2">{wallet.email}</td>
                            <td className="p-2">${wallet.balance?.toFixed(2)}</td>
                            <td className="p-2">{new Date(wallet.updated_at).toLocaleString()}</td>
                            <td className="p-2">
                              <button
                                className="text-blue-600 underline"
                                onClick={() => handleViewTransactions(wallet)}
                              >
                                View Transactions
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Transactions Modal */}
            {showTransactions && selectedWallet && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
                  <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                    onClick={() => setShowTransactions(false)}
                  >
                    ✕
                  </button>
                  <h2 className="text-xl font-bold mb-2">
                    Transactions for {selectedWallet.email} ({selectedWallet.user_id})
                  </h2>
                  {transactionsLoading ? (
                    <div className="py-4 text-center">Loading...</div>
                  ) : transactionsError ? (
                    <div className="py-4 text-center text-red-500">{transactionsError}</div>
                  ) : transactions.length === 0 ? (
                    <div className="py-4 text-center">No transactions found</div>
                  ) : (
                    <div className="overflow-x-auto max-h-96">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Type</th>
                            <th className="text-left p-2">Amount</th>
                            <th className="text-left p-2">Description</th>
                            <th className="text-left p-2">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.map((tx) => (
                            <tr key={tx.id} className="border-b">
                              <td className="p-2">{tx.type}</td>
                              <td className="p-2">{tx.amount > 0 ? '+' : ''}${tx.amount.toFixed(2)}</td>
                              <td className="p-2">{tx.description || '-'}</td>
                              <td className="p-2">{new Date(tx.created_at).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* All Transactions Tab */}
        {activeTab === 'transactions' && (
          <Card>
            <CardContent>
              {allTransactionsLoading ? (
                <div className="text-center py-4">Loading...</div>
              ) : allTransactionsError ? (
                <div className="text-center py-4 text-red-500">{allTransactionsError}</div>
              ) : allTransactions.length === 0 ? (
                <div className="text-center py-4">No transactions found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">User ID</th>
                        <th className="text-left p-2">Email</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Amount</th>
                        <th className="text-left p-2">Description</th>
                        <th className="text-left p-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allTransactions.map((tx) => (
                        <tr key={tx.id} className="border-b">
                          <td className="p-2">{tx.user_id}</td>
                          <td className="p-2">{tx.email}</td>
                          <td className="p-2">{tx.type}</td>
                          <td className="p-2">{tx.amount > 0 ? '+' : ''}${tx.amount.toFixed(2)}</td>
                          <td className="p-2">{tx.description || '-'}</td>
                          <td className="p-2">{new Date(tx.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminWallets; 