const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../config/APIError');
const Restaurant = require('./restaurant.model');

/**
 * Meal Schema
 * @private
 */
const mealSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true
  },
  description: {
    type: String,
    require: true
  },
  price: {
    type: Number,
    require: true,
  },
  restaurant: {
    type: mongoose.Types.ObjectId,
    ref: "Restaurant"
  }
}, {
  timestamps: true,
});

/**
 * Methods
 */
mealSchema.method({

  // Transform meal data for returning to the response.
  toJSON() {
    const jsonObject = {};
    const fields = ['id', 'name', 'description', 'price', 'restaurant'];
    
    fields.forEach((field) => {
      jsonObject[field] = this[field];
    });

    if (this.restaurant instanceof Restaurant) {
      jsonObject['restaurant'] = this.restaurant.toJSON();
    }

    return jsonObject;
  },

});

mealSchema.statics = {

  /**
   * Get meal
   */
  async get(id) {
    try {
      let meal = await this.findById(id);

      if (meal) {
        return meal;
      }

      // Returns error if meal doesn't exist
      throw new APIError({
        message: 'Meal does not exist',
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      throw error;
    }
  },


  /**
   * List meals in ascending order of 'createdAt' timestamp.
   */
  async list({
    page = 1, perPage = 10, search, restaurantId,
  }) {
    page = parseInt(page);
    perPage = parseInt(perPage);
    let match = {};
    if (restaurantId) {
      match["restaurant.id"] = new mongoose.Types.ObjectId(restaurantId);
    }
    
    if (search) {
      match["$or"] = [
        {
          "name": RegExp(search, "i") 
        },
        {
          "description": RegExp(search, "i") 
        }
      ]
    }

    try {
      let aggregate = [
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
            "name": 1,
            "description": 1,
            "price": 1,
            "createdAt": 1,
            "restaurant.id": "$restaurant._id",
            "restaurant.name": 1,
          }
        },
        {
          "$match": match
        },
        { "$skip": perPage * (page - 1) }
      ];

      if (perPage > 0) {
        aggregate.push({ "$limit": perPage });
      }

      let meals = await this.aggregate(aggregate);

      // Get total from search options. "user" field is used instead of "user.id"
      if (match["restaurant.id"]) {
        match["restaurant"] = match["restaurant.id"];
        delete match["restaurant.id"];
      }
      
      let total = await this.countDocuments(match).exec();

      return { meals, total, page, totalPages: Math.ceil(total / perPage) };
    } catch (error) {
      throw error;
    }

  },

};

/**
 * @typedef Meal
 */
module.exports = mongoose.model('Meal', mealSchema);
