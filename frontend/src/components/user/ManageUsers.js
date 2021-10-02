import React, { useState, useEffect } from "react";
import Pagination from "react-js-pagination";
import { Link } from "react-router-dom";
import moment from "moment-timezone";
import { fetchUsers, deleteUser } from "../../services";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const auth = JSON.parse(localStorage.getItem("auth"));

  async function fetchData() {
    try {
      const data = await fetchUsers({ page, perPage, search });
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
  }, [page, perPage, search]);

  const onDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(userId);
        fetchData();
      } catch (e) {}
    }
  };

  const roleText = (role) => {
    if (role === "admin") {
      return "Admin";
    } else if (role === "user") {
      return "Customer";
    } else if (role === "owner") {
      return "Owner";
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
            <th>Description</th>
            <th>Role</th>
            <th>Created Date</th>
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
                <td>{roleText(user.role)}</td>
                <td>{moment(user.createdAt).format("MMMM D YYYY")}</td>

                <td>
                  {auth.user.id !== user.id && (
                    <>
                      <Link
                        className="btn text-secondary"
                        to={`/manage/users/${user.id}/edit`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <i className="fas fa-edit"></i>
                      </Link>
                      <a
                        className="btn text-secondary"
                        onClick={(e) => {
                          onDelete(user.id);
                        }}
                      >
                        <i className="far fa-trash-alt"></i>
                      </a>
                    </>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <h4 className="pt-2">Manage Users</h4>
              <div className="clearfix pt-3">
                <div className="bs-bars float-right">
                  <div id="toolbar">
                    <Link className="btn btn-success" to="/manage/users/new">
                      Add new user
                    </Link>
                  </div>
                </div>
                <div className=" float-left form-group has-search">
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
            </div>
            <div className="card-body">
              <div className="">{renderTable()}</div>

              {!fetchError && loaded && users.length === 0 && (
                <div className="text-center">"No users found."</div>
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
        </div>
      </div>
    </div>
  );
}
