import React, { useState, useEffect } from "react";
import Pagination from "react-js-pagination";
import { Link, useParams } from "react-router-dom";
import { fetchMeals, deleteMeal, fetchRestaurant } from "../../services";
import RestaurantUsers from "../user/RestaurantUsers";

export default function ManageMeals({ history }) {
  const { restaurantId } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);

  async function fetchRestaurantData() {
    if (!restaurantId) {
      history.goBack();
    }
    try {
      const data = await fetchRestaurant(restaurantId);
      setRestaurant(data);
    } catch (e) {
      setFetchError(e.message);
    }
  }

  async function fetchData() {
    try {
      const data = await fetchMeals({ page, perPage, restaurantId, search });
      setMeals(data.meals);
      setTotal(data.total);
      setPage(data.page);
      setLoaded(true);
    } catch (e) {
      setFetchError(e.message);
    }
  }

  useEffect(() => {
    fetchRestaurantData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, perPage, search, restaurantId]);

  const onDelete = async (mealId) => {
    if (window.confirm("Are you sure you want to delete this meal?")) {
      try {
        await deleteMeal(mealId);
        fetchData();
      } catch (e) {}
    }
  };

  const startIndex = Math.min(perPage * (page - 1) + 1, total);
  const endIndex = Math.min(startIndex + perPage - 1, total);

  const renderMealsTable = () => {
    return (
      <table className="table table-hover mb-0">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Description</th>
            <th>Price($)</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {meals &&
            meals.map((meal, idx) => (
              <tr key={meal.id}>
                <th>{startIndex + idx}</th>
                <td>{meal.name}</td>
                <td>{meal.description}</td>
                <td>{meal.price.toFixed(2)}</td>
                <td>
                  <Link
                    className="btn text-secondary"
                    to={`/manage/meals/${meal.id}/edit`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <i className="fas fa-edit"></i>
                  </Link>
                  <a
                    className="btn text-secondary"
                    onClick={(e) => {
                      onDelete(meal.id);
                    }}
                  >
                    <i className="far fa-trash-alt"></i>
                  </a>
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
          {restaurant && (
            <div className="card">
              <div className="card-header">
                <h4>Restaurant Detail</h4>
              </div>
              <div className="card-body">
                <h5 className="pt-2 mb-3">{restaurant.name}</h5>
                <p className="text-secondary mb-1">{restaurant.foodType}</p>
                <p className="text-secondary">{restaurant.description}</p>
              </div>
            </div>
          )}

          {restaurant && meals && (
            <div className="card mt-5">
              <div className="card-body">
                <h5 className="mt-2">Manage Meals</h5>
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
                  <div className="float-right">
                    <Link
                      className="btn btn-success"
                      to={`/manage/restaurants/${restaurantId}/meals/new`}
                    >
                      Add new meal
                    </Link>
                  </div>
                </div>

                {renderMealsTable()}
                {loaded && !fetchError && meals.length === 0 && (
                  <p>
                    {search.length == 0
                      ? "No meals served in the restaurant."
                      : "No meals found."}
                  </p>
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

          <RestaurantUsers restaurantId={restaurantId} />
        </div>
      </div>
    </div>
  );
}
