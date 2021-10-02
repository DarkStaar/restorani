const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { omitBy, isNil } = require('lodash');
const APIError = require('../config/APIError');
const User = require('./user.model');
const Restaurant = require('./restaurant.model');

/**
 * Order Schema
 * @private
 */
const orderSchema = new mongoose.Schema({
  meals: [{
    id: {
      type: mongoose.Types.ObjectId,
      ref: "Meal"
    },
    name: {
      type: String,
      required: true
    },
    count: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  }],
  total: {
    type: Number,
    require: true,
  },
  status: {
    type: Number,
    required: true,
    default: 1
  },
  track: [{
    status: Number,
    time: Date
  }],
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User"
  },
  restaurant: {
    type: mongoose.Types.ObjectId,
    ref: "Restaurant"
  }
}, {
  timestamps: true,
});

orderSchema.method({

  // Transform order data for returning to the response.
  toJSON() {
    const jsonObject = {};
    const fields = ['id', 'meals', 'total', 'status', 'track', 'user', 'restaurant'];
    
    fields.forEach((field) => {
      jsonObject[field] = this[field];
    });

    let jsonMealObject = [];
    this['meals'].forEach((meal) => {
      jsonMealObject.push({
        id: meal['id'],
        name: meal['name'],
        price: meal['price'],
        count: meal['count']
      });
    });
    
    
    fields.forEach((field) => {
      jsonObject[field] = this[field];
    });

    jsonObject['meals'] = jsonMealObject;

    if (this.user instanceof User) {
      jsonObject['user'] = this.user.toJSON();
    }

    if (this.restaurant instanceof Restaurant) {
      jsonObject['restaurant'] = this.restaurant.toJSON();
    }

    return jsonObject;
  },

});

/**
 * Statics
 */
orderSchema.statics = {

  /**
   * Get order
   */
  async get(id) {
    try {
      let order = await this.findById(id).populate("user").populate("restaurant");

      if (order) {
        return order;
      }

      // Returns error if order doesn't exist
      throw new APIError({
        message: 'Order does not exist',
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      throw error;
    }
  },


  /**
   * List orders in ascending order of 'createdAt' timestamp.
   */
  async list({
    page = 1, perPage = 10, status, restaurantId, userId, restaurants
  }) {
    page = parseInt(page);
    perPage = parseInt(perPage);
    let match = omitBy({ "restaurant.id": restaurantId, "user.id": userId }, isNil);
    if (status && status > 0) {
      match["status"] = parseInt(status);
    }
    if (restaurants) {
      match['restaurant.id'] = {$in: restaurants};
    }

    try {
      let aggregate = [
        {
          "$lookup": {
            "from": "users",
            "localField": "user",
            "foreignField": "_id",
            "as": "user"
          }
        },
        { "$unwind": "$user" },
        {
          "$lookup": {
            "from": "restaurants",
            "localField": "restaurant",
            "foreignField": "_id",
            "as": "restaurant"
          }
        },
        { "$unwind": "$restaurant" },
        {
          "$project": {
            "_id": 0,
            "id": "$_id",
            "meals": 1,
            "total": 1,
            "status": 1,
            "track": 1,
            "createdAt": 1,
            "user.id": "$user._id",
            "user.name": 1,
            "restaurant.id": "$restaurant._id",
            "restaurant.name": 1,
          }
        },
        {
          "$match": match
        },
        { "$sort": { createdAt: -1 }},
        { "$skip": perPage * (page - 1) }
      ];
      console.log(aggregate);
      if (perPage > 0) {
        aggregate.push({ "$limit": perPage });
      }

      let orders = await this.aggregate(aggregate);

      if (match["restaurant.id"]) {
        match["restaurant"] = match["restaurant.id"];
        delete match["restaurant.id"];
      }

      if (match["user.id"]) {
        match["user"] = match["user.id"];
        delete match["user.id"];
      }
      
      let total = await this.countDocuments(match).exec();

      return { orders, total, page, totalPages: Math.ceil(total / perPage) };
    } catch (error) {
      throw error;
    }
  },
};

/**
 * @typedef Order
 */
module.exports = mongoose.model('Order', orderSchema);
