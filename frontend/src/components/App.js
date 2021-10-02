import React, { useState } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import AuthRoute from "./AuthRoute";
import Header from "./Header";
import Login from "./auth/Login";
import Register from "./auth/Register";
import Logout from "./auth/Logout";
import Account from "./auth/Account";
import ManageUsers from "./user/ManageUsers";
import UserAdd from "./user/UserAdd";
import UserEdit from "./user/UserEdit";
import ManageRestaurants from "./restaurant/ManageRestaurants";
import RestaurantAdd from "./restaurant/RestaurantAdd";
import RestaurantEdit from "./restaurant/RestaurantEdit";
import ManageMeals from "./meal/ManageMeals";
import MealAdd from "./meal/MealAdd";
import MealEdit from "./meal/MealEdit";
import Restaurants from "./restaurant/Restaurants";
import Restaurant from "./restaurant/Restaurant";
import ManageOrders from "./order/ManageOrders";
import ManageOrder from "./order/ManageOrder";
import Orders from "./order/Orders";
import Order from "./order/Order";
import AppContext from "./AppContext";

export default function App() {
  const [auth, setAuth] = useState(JSON.parse(localStorage.getItem("auth")));
  return (
    <AppContext.Provider value={{ auth, setAuth }}>
      <Router>
        <div className="App">
          <Header />
          <div className="main container py-4 mt-4">
            <Switch>
              <AuthRoute
                exact
                permit="admin,owner,user"
                path="/"
                components={{
                  admin: ManageUsers,
                  owner: ManageRestaurants,
                  user: Restaurants,
                }}
              />
              <Route exact path="/login" component={Login} />
              <Route exact path="/register" component={Register} />
              <Route exact path="/logout" component={Logout} />
              <AuthRoute
                exact
                path="/account"
                component={Account}
              />
              <AuthRoute
                exact
                permit="admin"
                path="/manage/users"
                component={ManageUsers}
              />
              <AuthRoute
                exact
                permit="admin"
                path="/manage/users/new"
                component={UserAdd}
              />
              <AuthRoute
                exact
                permit="admin"
                path="/manage/users/:userId/edit"
                component={UserEdit}
              />
              <AuthRoute
                exact
                permit="owner"
                path="/manage/restaurants"
                component={ManageRestaurants}
              />
              <AuthRoute
                exact
                permit="owner"
                path="/manage/restaurants/new"
                component={RestaurantAdd}
              />
              <AuthRoute
                exact
                permit="owner"
                path="/manage/restaurants/:restaurantId/edit"
                component={RestaurantEdit}
              />
              <AuthRoute
                exact
                permit="owner"
                path="/manage/restaurants/:restaurantId/meals"
                component={ManageMeals}
              />
              <AuthRoute
                exact
                permit="owner"
                path="/manage/restaurants/:restaurantId/meals/new"
                component={MealAdd}
              />
              <AuthRoute
                exact
                permit="owner"
                path="/manage/meals/:mealId/edit"
                component={MealEdit}
              />
              <AuthRoute
                exact
                permit="owner"
                path="/manage/orders"
                component={ManageOrders}
              />
              <AuthRoute
                exact
                permit="owner"
                path="/manage/orders/:orderId"
                component={ManageOrder}
              />
              <AuthRoute
                exact
                permit="user"
                path="/restaurants"
                component={Restaurants}
              />
              <AuthRoute
                exact
                permit="user"
                path="/restaurants/:restaurantId"
                component={Restaurant}
              />
              <AuthRoute
                exact
                permit="user"
                path="/orders"
                component={Orders}
              />
              <AuthRoute
                exact
                permit="user"
                path="/orders/:orderId"
                component={Order}
              />
            </Switch>
          </div>
        </div>
      </Router>
    </AppContext.Provider>
  );
}
