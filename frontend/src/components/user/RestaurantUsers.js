import React, { useState, useEffect } from "react";
import Pagination from "react-js-pagination";
import {
  fetchRestaurantUsers,
  blockRestaurantUser,
  unblockRestaurantUser,
} from "../../services";

export default function RestaurantUsers({ restaurantId }) {
  const [users, setUsers] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);

  async function fetchData() {
    try {
      const data = await fetchRestaurantUsers(restaurantId, {
        page,
        perPage,
        search,
      });
      setUsers(data.users);
      setTotal(data.total);
      setPage(data.page);
      setLoaded(true);
    } catch (e) {
      setFetchError(e.message);
    }
  }

  useEffect(() => {
    fetchData();
  }, [page, perPage, search, restaurantId]);

  const blockUser = async (userId) => {
    try {
      await blockRestaurantUser(restaurantId, userId);
      fetchData();
    } catch (e) {
      console.log(e);
    }
  };

  const unblockUser = async (userId) => {
    try {
      await unblockRestaurantUser(restaurantId, userId);
      fetchData();
    } catch (e) {
      console.log(e);
    }
  };

  const startIndex = Math.min(perPage * (page - 1) + 1, total);
  const endIndex = Math.min(startIndex + perPage - 1, total);

  const renderTable = () => {
    return (
      <table className="table table-hover mb-0">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Blocked</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users &&
            users.map((user, idx) => (
              <tr key={user.id}>
                <th>{startIndex + idx}</th>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td className="text-danger">{user.blocked && "Blocked"}</td>
                <td>
                  <button
                    className={
                      "btn btn-sm " +
                      (user.blocked ? "btn-success" : "btn-danger")
                    }
                    onClick={() =>
                      user.blocked ? unblockUser(user.id) : blockUser(user.id)
                    }
                  >
                    {user.blocked ? "Unblock" : "Block"}
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    );
  };

  return (
    <div>
      {restaurantId && (
        <div className="card mt-5">
          <div className="card-body">
            <h5 className="mt-2">Block Users for the restaurant</h5>
            <div>
              <div className="float-left form-group has-search">
                <span className="fa fa-search form-control-feedback"></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>

            {renderTable()}
            {loaded && !fetchError && users.length === 0 && (
              <p>No users found.</p>
            )}
          </div>
          <div className="card-footer">
            <div className="float-right"></div>

            <Pagination
              itemClass="page-item"
              linkClass="page-link"
              innerClass="pagination float-right"
              prevPageText="‹"
              nextPageText="›"
              activePage={page}
              itemsCountPerPage={perPage}
              totalItemsCount={total}
              pageRangeDisplayed={5}
              onChange={(p) => setPage(p)}
            />
            <div className="float-right mx-4 mt-2">
              Showing ({startIndex} - {endIndex}) / {total}
            </div>
            <div className="float-right mr-2 mt-1">
              Show per page &nbsp;
              <select
                className="form-control-sm"
                value={perPage}
                onChange={(event) => {
                  setPerPage(parseInt(event.target.value));
                  setPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
