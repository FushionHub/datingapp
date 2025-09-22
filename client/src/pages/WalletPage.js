import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getWallet, initializePayment } from '../services/supabaseService';

const WalletPage = () => {
  const { currentUser } = useAuth();
  const [wallet, setWallet] = useState(null);
  // We will assume getTransactions is defined elsewhere or remove it if not used
  // const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [provider, setProvider] = useState('paystack'); // 'paystack' or 'flutterwave'
  const [error, setError] = useState('');

  useEffect(() => {
    const loadWalletData = async () => {
      setLoading(true);
      const walletData = await getWallet(currentUser.uid);
      // Assuming walletData is an array, we take the first one for simplicity
      setWallet(walletData && walletData.length > 0 ? walletData[0] : null);
      // if (walletData && walletData.length > 0) {
      //   const transactionData = await getTransactions(walletData[0].id);
      //   setTransactions(transactionData);
      // }
      setLoading(false);
    };
    loadWalletData();
  }, [currentUser]);

  const handleAddFunds = async (e) => {
    e.preventDefault();
    setError('');
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    setLoading(true);
    const paymentData = await initializePayment(numericAmount, 'NGN', provider);
    setLoading(false);

    if (paymentData && paymentData.authorization_url) {
      window.location.href = paymentData.authorization_url;
    } else {
      setError('Could not initiate payment. Please try again.');
    }
  };

  if (loading && !wallet) {
    return <div>Loading wallet...</div>;
  }

  return (
    <div>
      <Link to="/">Back to Dashboard</Link>
      <h1>My Wallet</h1>
      {wallet ? (
        <div>
          <h2>Current Balance: {wallet.currency} {wallet.balance}</h2>
          <form onSubmit={handleAddFunds}>
            <h3>Add Funds</h3>
            {error && <p style={{color: 'red'}}>{error}</p>}
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              step="0.01"
              required
            />
            <div style={{ margin: '10px 0' }}>
              <strong>Select Payment Provider:</strong>
              <div>
                <label>
                  <input
                    type="radio"
                    name="provider"
                    value="paystack"
                    checked={provider === 'paystack'}
                    onChange={(e) => setProvider(e.target.value)}
                  />
                  Paystack
                </label>
              </div>
              <div>
                <label>
                  <input
                    type="radio"
                    name="provider"
                    value="flutterwave"
                    checked={provider === 'flutterwave'}
                    onChange={(e) => setProvider(e.target.value)}
                  />
                  Flutterwave
                </label>
              </div>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Initializing...' : 'Add Funds'}
            </button>
          </form>
        </div>
      ) : (
        <p>Could not load wallet information. A wallet will be created for you automatically.</p>
      )}

      <hr />

      <div>
        <h3>Transfer Funds</h3>
        <p>Click here to send money to another user.</p>
        <Link to="/transfer">
          <button>Go to Transfer Page</button>
        </Link>
      </div>

      <hr />

      <h3>Transaction History</h3>
      {/* Transaction history display removed for now to fix compile error */}
      <p>Transaction history is temporarily unavailable.</p>
    </div>
  );
};

export default WalletPage;
