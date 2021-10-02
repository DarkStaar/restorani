const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { omitBy, isNil } = require('lodash');
const APIError = require('../config/APIError');
const User = require('./user.model');

/**
 * Restaurant Schema
 * @private
 */
const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true
  },
  description: {
    type: String,
    require: true
  },
  foodType: {
    type: String,
    require: true,
  },
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "User"
  }
}, {
  timestamps: true,
});

/**
 * Methods
 */
restaurantSchema.method({

  // Transform restaurant data for returning to the response.
  toJSON() {
    const jsonObject = {};
    const fields = ['id', 'name', 'description', 'foodType', 'owner'];
    
    fields.forEach((field) => {
      jsonObject[field] = this[field];
    });

    if (this.owner instanceof User) {
      jsonObject['owner'] = this.owner.toJSON();
    }

    return jsonObject;
  },

});

restaurantSchema.statics = {

  /**
   * Get restaurant
   */
  async get(id) {
    try {
      let restaurant = await this.findById(id);

      if (restaurant) {
        return restaurant;
      }

      // Returns error if restaurant doesn't exist
      throw new APIError({
        message: 'Restaurant does not exist',
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      throw error;
    }
  },


  /**
   * List restaurants in ascending order of 'createdAt' timestamp.
   */
  async list({
    page = 1, perPage = 10, search, ownerId,
  }) {
    let match = {};
    if (ownerId && mongoose.Types.ObjectId.isValid(ownerId)) {
      match["owner.id"] = mongoose.Types.ObjectId(ownerId);
    }

    page = parseInt(page);
    perPage = parseInt(perPage);

    if (search) {
      match["$or"] = [
        {
          "name": RegExp(search, "i") 
        },
        {
          "description": RegExp(search, "i") 
        },
        {
          "foodType": RegExp(search, "i") 
        }
      ]
    }

    try {
      let aggregate = [
        {
          "$lookup": {
            "from": "users",
            "localField": "owner",
            "foreignField": "_id",
            "as": "owner"
          }
        },
        { "$unwind": "$owner" },
        {
          "$lookup": {
            "from": "meals",
            "localField": "_id",
            "foreignField": "restaurant",
            "as": "meals"
          }
        },
        {
          "$project": {
            "_id": 0,
            "id": "$_id",
            "name": 1,
            "description": 1,
            "foodType": 1,
            "createdAt": 1,
            "owner.id": "$owner._id",
            "owner.name": 1,
            "mealsCount": { "$size": "$meals" }
          }
        },
        {
          "$match": match
        },
        { "$sort": { startdate: 1, createdAt: 1 }},
        { "$skip": perPage * (page - 1) }
      ];

      if (perPage > 0) {
        aggregate.push({ "$limit": parseInt(perPage) });
      }
      let restaurants = await this.aggregate(aggregate);

      // Get total from search options. "user" field is used instead of "user.id"
      if (match["restaurant.id"]) {
        match["restaurant"] = match["restaurant.id"];
        delete match["restaurant.id"];
      }

      if (match["owner.id"]) {
        match["owner"] = match["owner.id"];
        delete match["owner.id"];
      }
      let total = await this.countDocuments(match).exec();
      return { restaurants, total, page, perPage, totalPages: Math.ceil(total / perPage) };
    } catch (error) {
      throw error;
    }

  },

};

/**
 * @typedef Restaurant
 */
module.exports = mongoose.model('Restaurant', restaurantSchema);
