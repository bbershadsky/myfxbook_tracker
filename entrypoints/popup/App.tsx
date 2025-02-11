import { useState, useEffect } from "react";
import "./App.css";

function formatNumber(num) {
  return num.toLocaleString();
}

function AccountDetails({ account, onBack }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory(account.id);
  }, [account.id]);

  const fetchHistory = async (accountId) => {
    const session = localStorage.getItem("session");
    const response = await fetch(
      `https://www.myfxbook.com/api/get-history.json?session=${session}&id=${accountId}`
    );
    const data = await response.json();
    if (!data.error) {
      setHistory(data.history);
    }
  };

  return (
    <div className="account-details">
      <h2>{account.name}</h2>
      <p className="large-text">
        <strong>Abs Gain:</strong> {account.absGain}% <strong>Profit:</strong> $
        {formatNumber(account.profit)}
      </p>
      <p>
        <strong>Daily:</strong> {account.daily}% <strong>Monthly:</strong>{" "}
        {account.monthly}% <strong>Balance:</strong> $
        {formatNumber(account.balance)}
      </p>
      <p>
        <strong>Max Drawdown:</strong> {account.drawdown}%{" "}
        <strong>Profit Factor:</strong> {account.profitFactor}{" "}
        <strong>Pips:</strong> {formatNumber(account.pips)}
      </p>

      <h3>Trade History</h3>
      <table className="history-table">
        <thead>
          <tr>
            <th>Open Time</th>
            <th>Close Time</th>
            <th>Symbol</th>
            <th>Action</th>
            <th>Size</th>
            <th>Open Price</th>
            <th>Close Price</th>
            <th>Profit</th>
          </tr>
        </thead>
        <tbody>
          {history.map((trade, index) => (
            <tr key={index}>
              <td>{trade.openTime}</td>
              <td>{trade.closeTime}</td>
              <td>{trade.symbol}</td>
              <td>{trade.action}</td>
              <td>{trade.sizing.value}</td>
              <td>{trade.openPrice}</td>
              <td>{trade.closePrice}</td>
              <td>${trade.profit}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={onBack}>Back to Accounts</button>
    </div>
  );
}

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState(localStorage.getItem("session") || "");
  const [accounts, setAccounts] = useState([]);
  const [viewingAccount, setViewingAccount] = useState(() => {
    return JSON.parse(localStorage.getItem("lastViewedAccount") || "null");
  });
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (session) {
      fetchAccounts(session);
    }
  }, [session]);

  const handleLogin = async () => {
    const response = await fetch(
      `https://www.myfxbook.com/api/login.json?email=${email}&password=${password}`
    );
    const data = await response.json();

    if (data.error) {
      setErrorMessage(data.message);
    } else {
      setSession(data.session);
      localStorage.setItem("session", data.session);
      fetchAccounts(data.session);
    }
  };

  const fetchAccounts = async (session) => {
    const response = await fetch(
      `https://www.myfxbook.com/api/get-my-accounts.json?session=${session}`
    );
    const data = await response.json();
    if (!data.error) {
      setAccounts(data.accounts.reverse());
    }
  };

  if (viewingAccount) {
    return (
      <AccountDetails
        account={viewingAccount}
        onBack={() => setViewingAccount(null)}
      />
    );
  }

  return (
    <div className="app-container">
      {!session ? (
        <div className="card">
          <img src="logo.png" alt="myfxbook logo" width={200} />
          <input
            type="text"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Connect my account</button>
          {errorMessage && <p className="error">{errorMessage}</p>}
        </div>
      ) : (
        <div className="accounts-container">
          <h2>Your Accounts</h2>
          <table className="accounts-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Abs Gain</th>
                <th>Daily</th>
                <th>Monthly</th>
                <th>Profit</th>
                <th>Balance</th>
                <th>Max Drawdown</th>
                <th>Profit Factor</th>
                <th>Pips</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id}>
                  <td>{account.name}</td>
                  <td>{account.absGain}%</td>
                  <td>{account.daily}%</td>
                  <td>{account.monthly}%</td>
                  <td>${account.profit}</td>
                  <td>${formatNumber(account.balance)}</td>
                  <td>{account.drawdown}%</td>
                  <td>{account.profitFactor}</td>
                  <td>{account.pips}</td>
                  <td>
                    <button
                      onClick={() => {
                        setViewingAccount(account);
                        localStorage.setItem(
                          "lastViewedAccount",
                          JSON.stringify(account)
                        );
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
