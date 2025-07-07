<h5 className="mt-4">History</h5>
      {data.length === 0 ? (
        <p className="text-muted">No history yet.</p>
      ) : (
        data.map((item) => (
          <div key={item.id} className="card mb-3 p-3 d-flex align-items-center expense-card">
            <div className="d-flex align-items-center w-100">
              {/* Category Icon */}
              <div className="category-icon-circle me-3">
                {getCategoryIcon(item.category)}
              </div>

              {/* Transaction Info */}
              <div className="flex-grow-1">
                <h5 className="fw-bold fs-6 mb-1">{item.name}</h5>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">{item.date}</span>
                  <span className="fw-bold text-success">₹{item.amount}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="d-flex gap-2 ms-3">
                <button
                  onClick={() => editTransaction(item.id)}
                  className="btn btn-sm btn-outline-primary"
                >
                  <FontAwesomeIcon icon={faUserEdit} />
                </button>
                <button
                  onClick={() => deleteTransaction(item.id)}
                  className="btn btn-sm btn-outline-danger"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          </div>
        ))
      )} 