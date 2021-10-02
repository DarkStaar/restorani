const mongoose = require('mongoose');
const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const moment = require('moment-timezone');
const jwt = require('jwt-simple');
const APIError = require('../config/APIError');
const { env, jwtSecret, jwtExpirationInterval } = require('../config/config');

/**
 * User Schema
 * @private
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: 128,
    index: true,
    trim: true,
  },
  email: {
    type: String,
    match: /^\S+@\S+\.\S+$/,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    default: 'user',
  },
}, {
  timestamps: true,
});


userSchema.pre('save', async function save(next) {
  try {
    
    // Check if password field is modified.
    if (!this.isModified('password')) return next();

    // Encrypt password using bcrypt
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;

    return next();
  } catch (error) {
    return next(error);
  }
});

/**
 * Methods
 */
userSchema.method({

  // Transform user data for returning to the response
  toJSON() {
    const jsonObject = {};
    const fields = ['id', 'name', 'email', 'role', 'createdAt'];

    fields.forEach((field) => {
      jsonObject[field] = this[field];
    });

    return jsonObject;
  },

  // Generate JWT Token from user id
  token() {
    const playload = {
      exp: moment().add(jwtExpirationInterval, 'minutes').unix(),
      iat: moment().unix(),
      sub: this._id,
    };
    return jwt.encode(playload, jwtSecret);
  },

  // Compare to check if raw password matches encrypted password
  async passwordMatches(password) {
    return bcrypt.compare(password, this.password);
  },
});

/**
 * Statics
 */
userSchema.statics = {

  /**
   * Get user
   */
  async get(id) {
    try {
      let user;

      // Find user by user id
      if (mongoose.Types.ObjectId.isValid(id)) {
        user = await this.findById(id).exec();
      }
      if (user) {
        return user;
      }

      // Throws API error if user does not exist
      throw new APIError({
        message: 'User does not exist',
        status: httpStatus.NOT_FOUND,
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Find user by email and tries to generate a JWT token
   *
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  async findAndGenerateToken(options) {
    const { email, password, refreshObject } = options;
    if (!email) throw new APIError({ message: 'An email is required to generate a token' });

    // Find user by email
    const user = await this.findOne({ email }).exec();
    const err = {
      status: httpStatus.UNAUTHORIZED,
      isPublic: true,
    };

    // If password field exists check if password matches and generate token 
    if (password) {
      if (user && await user.passwordMatches(password)) {
        return { user, accessToken: user.token() };
      }
      err.message = 'Incorrect email or password';
    } else if (refreshObject && refreshObject.userEmail === email) {
      // if refresh token exists, generate token from refresh token
      if (moment(refreshObject.expires).isBefore()) {
        err.message = 'Invalid refresh token.';
      } else {
        return { user, accessToken: user.token() };
      }
    } else {
      err.message = 'Incorrect email or refreshToken';
    }
    throw new APIError(err);
  },

  /**
   * List users in ascending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<User[]>}
   */

  async list({
    page = 1, perPage = 10, search,
  }) {

    let match = {};
    page = parseInt(page);
    perPage = parseInt(perPage);

    try {
      let aggregate = [
        {
          "$project": {
            "_id": 0,
            "id": "$_id",
            "name": 1,
            "email": 1,
            "role": 1,
            "createdAt": 1
          }
        },
        {
          "$match": match
        },
        { "$sort": { createdAt: 1 }},
        { "$skip": perPage * (page - 1) }
      ];

      if (perPage > 0) {
        aggregate.push({ "$limit": parseInt(perPage) });
      }

      let users = await this.aggregate(aggregate);
      let total = await this.countDocuments(match).exec();

      return { users, total, page, perPage, totalPages: Math.ceil(total / perPage) };
    } catch (error) {
      throw error;
    }

  },

  
  /**
   * List users for restaurant in ascending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<User[]>}
   */
   async listForRestaurant({
    page = 1, perPage = 10, search, restaurantId
  }) {
    let match = { role: "user" };
    page = parseInt(page);
    perPage = parseInt(perPage);

    if (search) {
      match["$or"] = [
        {
          "name": RegExp(search, "i") 
        },
        {
          "email": RegExp(search, "i") 
        },
      ]
    }

    try {
      let aggregate = [
        {
          "$lookup": {
            "from": "blockedusers",
            "let": { "user_id": "$_id" },
            "pipeline": [
              {
                "$match": {
                  "$expr": { 
                    "$and": [
                      { "$eq": ["$user", "$$user_id"] },
                      { "$eq": ["$restaurant", mongoose.Types.ObjectId(restaurantId)] },
                    ]
                  }
                }
              }
            ],
            "as": "blockedUsers"
          }
        },
        
        {
          "$project": {
            "_id": 0,
            "id": "$_id",
            "name": 1,
            "email": 1,
            "role": 1,
            "blocked": {"$cond": [{ "$gte": [{ $size: "$blockedUsers" }, 1]}, true, false]},
            "createdAt": 1
          }
        },
        {
          "$match": match
        },
        { "$sort": { createdAt: 1 }},
        { "$skip": perPage * (page - 1) }
      ];

      if (perPage > 0) {
        aggregate.push({ "$limit": parseInt(perPage) });
      }

      let users = await this.aggregate(aggregate);
      let total = await this.countDocuments(match).exec();

      return { users, total, page, perPage, totalPages: Math.ceil(total / perPage) };
    } catch (error) {
      throw error;
    }

  },
  
  /**
   * Return new validation error
   * if error is a mongoose duplicate key error
   */
  checkDuplicateEmail(error) {
    // If there is error, check if error is due to email duplicate of mongodb
    if (error.name === 'MongoError' && error.code === 11000) {
      return new APIError({
        message: 'Email has been taken already.',
        errors: [{
          field: 'email',
          location: 'body',
          messages: ['"email" already exists'],
        }],
        status: httpStatus.CONFLICT,
        isPublic: true,
        stack: error.stack,
      });
    }
    return error;
  },

};

/**
 * @typedef User
 */
module.exports = mongoose.model('User', userSchema);
