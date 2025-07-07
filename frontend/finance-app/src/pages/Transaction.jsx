import TransactionBox from './TransactionBox.jsx';
import { useState } from 'react';
function Transaction() {
  const [income, setIncome] = useState([]);

  return (
    <div className="main-container d-flex">
      <div className="sidebar-placeholder"></div>
      <div className="content-container d-flex flex-grow-1">
        <div className="income-section flex-fill p-4">
          <TransactionBox label="Income" data={income} setData={setIncome} />
        </div>
      </div>
    </div>
  );
}

export default Transaction;
