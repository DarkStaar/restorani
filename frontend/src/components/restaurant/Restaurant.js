import React, { useState, useEffect } from "react";
import Pagination from "react-js-pagination";
import Modal from "react-bootstrap/Modal";
import { useParams } from "react-router-dom";
import { fetchMeals, fetchRestaurant, createOrder } from "../../services";
import MealDialog from "../meal/MealDialog";

export default function Meals({ history }) {
  const { restaurantId } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [meals, setMeals] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [mealDialogOpen, setMealDialogOpen] = useState(false);

  async function fetchRestaurantData() {
    if (!restaurantId) {
      history.goBack();
    }
    try {
      const data = await fetchRestaurant(restaurantId);
      setRestaurant(data);
    } catch (e) {
      history.goBack();
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

  const orderMenu = async () => {
    try {
      if (cart.length > 0) {
        let meals = [],
          total = 0;
        cart.forEach((item) => {
          meals.push({
            id: item.meal.id,
            name: item.meal.name,
            count: item.count,
            price: item.meal.price,
          });
          total += item.meal.price * item.count;
        });

        let data = {
          meals,
          total,
          restaurantId,
        };
        await createOrder(data);
        setCart([]);
        history.push('/orders');
      }
    } catch (e) {
      console.log(e);
    }
  };

  const addToCart = (mealId, count = 1) => {
    if (cart.some((item) => item.meal.id === mealId)) {
      let newCart = cart.map((item) =>
        item.meal.id === mealId ? { ...item, count: item.count + count } : item
      );
      setCart(newCart);
    } else {
      const meal = meals.find((a) => a.id === mealId);
      setCart([...cart, { meal, count: count }]);
    }
  };

  const removeFromCart = (mealId) => {
    setCart(cart.filter((item) => item.meal.id !== mealId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const onSelectMeal = (mealId) => {
    const meal = meals.find((a) => a.id === mealId);
    setSelectedMeal(meal);
    setMealDialogOpen(true);
  };

  const onCloseMealDialog = () => {
    setMealDialogOpen(false);
  };

  const onAddMeal = (mealId, count) => {
    setMealDialogOpen(false);
    addToCart(mealId, count);
  };

  const cartTotal = cart.reduce(
    (total, item) => total + item.meal.price * item.count,
    0
  );

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
          </tr>
        </thead>
        <tbody>
          {meals &&
            meals.map((meal, idx) => (
              <tr
                className="cursor-pointer"
                key={meal.id}
                onClick={() => onSelectMeal(meal.id)}
              >
                <th>{startIndex + idx}</th>
                <td>{meal.name}</td>
                <td>{meal.description}</td>
                <td>{meal.price.toFixed(2)}</td>
              </tr>
            ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="container justify-content-between">
      <div className="side float-lg-right pl-lg-5 pb-5">
        
        <div
          className="card sticky-top"
          style={{ minHeight: "400px", position: "sticky" }}
        >
          <div className="card-header">
            <h5>My Cart</h5>
          </div>
          <div className="card-body">
            {cart.length > 0 && (
              <div>
                <div>
                  {cart.map((item) => (
                    <div key={item.meal.id} className="py-3">
                      <div className="d-flex">
                        <div className="flex-grow-1 text-align-left">
                          {item.meal.name}
                        </div>
                        <div className="flex-shrink-0 text-align-right px-3">
                          {item.count}
                        </div>

                        <div className="flex-shrink-0 text-align-right">
                          ${item.meal.price.toFixed(2)}
                        </div>

                        <div className="flex-shrink-0 text-align-right">
                          <a
                            className="btn text-secondary py-0 pr-0"
                            aria-label="Remove"
                            onClick={() => removeFromCart(item.meal.id)}
                          >
                            <i className="far fa-times-circle"></i>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-top border-secondary">
                  <div className="d-flex font-weight-bold py-3">
                    <div className="flex-grow-1 text-align-left">Total</div>
                    <div
                      className="flex-shrink-0 text-align-right"
                      style={{ paddingRight: "28px" }}
                    >
                      ${cartTotal.toFixed(2)}
                    </div>
                  </div>
                  <div className="float-right mt-2">
                  <div className="btn btn-success" onClick={orderMenu}>
                    Order
                      </div>
                    <div className="btn btn-secondary ml-3" onClick={clearCart}>
                    Clear Cart
                      </div>
                  </div>
                
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="content">
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

            {restaurant && meals && !fetchError &&  (
              <div className="card mt-5">
                <div className="card-body">
                  <h5 className="float-left mt-2">Meals in the restaurant</h5>
                  <div className=" float-right form-group has-search">
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

            {fetchError && (
              <p className="text-danger mt-4">{fetchError}</p>
            )}
          </div>
        </div>
      </div>

      <MealDialog
        meal={selectedMeal}
        open={mealDialogOpen}
        onClose={onCloseMealDialog}
        onAdd={onAddMeal}
      />
    </div>
  );
}
