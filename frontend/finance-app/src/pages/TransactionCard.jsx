import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

function TransactionCard({ item, getCategoryIcon, editTransaction, deleteTransaction }) {
  return (
    <div
      key={item.id}
      className="relative flex items-center gap-8 bg-white shadow-md p-6 rounded-2xl hover:shadow-xl transition duration-300 group w-full min-h-[160px] sm:min-h-[180px] mb-6"
    >
      {/* Category Icon */}
      <div className="w-16 h-16 min-w-[4rem] flex items-center justify-center rounded-full bg-indigo-200 text-indigo-800 text-2xl">
        {getCategoryIcon(item.category)}
      </div>

      {/* Transaction Info */}
      <div className="flex-grow w-100">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-xl font-semibold text-gray-800 mt-4">{item.name}</h4>
          <span className="text-xl font-bold text-green-600">₹{item.amount}</span>
        </div>
        <p className="text-sm text-gray-500 italic ml-1">{item.date}</p>
      </div>

      {/* Edit/Delete Icons - Visible on hover */}
      <div className="absolute top-1/2 -translate-y-1/2 right-8 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={() => editTransaction(item.id)}
          className="text-blue-600 hover:text-blue-800"
        >
          <FontAwesomeIcon icon={faUserEdit} />
        </button>
        <button
          onClick={() => deleteTransaction(item.id)}
          className="text-red-600 hover:text-red-800"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    </div>
  );
}

export default TransactionCard;
