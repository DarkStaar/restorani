import React, { useState, useEffect } from "react";
import Pagination from "react-js-pagination";
import { Link } from "react-router-dom";
import { fetchRestaurants } from "../../services";

export default function Restaurants({ history }) {
  const [restaurants, setRestaurants] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);

  async function fetchData() {
    try {
      const data = await fetchRestaurants({ page, perPage, search });
      setRestaurants(data.restaurants);
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

  const onClickRestaurant = (restaurantId) => {
    history.push(`/restaurants/${restaurantId}`);
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
            <th>Type of Food</th>
            <th>Meals</th>
          </tr>
        </thead>
        <tbody>
          {restaurants &&
            restaurants.map((restaurant, idx) => (
              <tr
                className="cursor-pointer"
                key={restaurant.id}
                onClick={() => onClickRestaurant(restaurant.id)}
              >
                <th>{startIndex + idx}</th>
                <td>{restaurant.name}</td>
                <td>{restaurant.description}</td>
                <td>{restaurant.foodType}</td>
                <td>{restaurant.mealsCount}</td>
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
          {fetchError && <div className="alert alert-danger">{fetchError}</div>}
          <div className="card">
            <div className="card-header">
              <h4 className="pt-2">All Restaurants</h4>
              <div className="clearfix pt-3">
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

              {!fetchError && loaded && restaurants.length === 0 && (
                <div className="text-center">
                  {search.length === 0
                    ? "There are no restaurants yet."
                    : "No restaurants found."}
                </div>
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
