const mongoose = require('mongoose');

/**
 * BlockedUser Schema
 * @private
 */
const blockedUserSchema = new mongoose.Schema({
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

blockedUserSchema.statics = {

  /**
   * Check if exists record with restaurant and user
   */
  async blocked(restaurantId, userId) {
    try {

      if (mongoose.Types.ObjectId.isValid(restaurantId, userId)) {
        const count =  await this.countDocuments({ restaurant: restaurantId, user: userId }).exec();
        return count > 0;
      }
      return false;

    } catch (error) {
      throw error;
    }
  },

  async blockUser(restaurantId, userId) {
    try {
      const document = await this.findOne({ restaurant: restaurantId, user: userId }).exec();
      if (!document) {
        const user = new this({restaurant: mongoose.Types.ObjectId(restaurantId), user: mongoose.Types.ObjectId(userId)})
        await user.save();
      }
    } catch (error) {
      throw error;
    }
  },

  async unblockUser(restaurantId, userId) {
    try {
      await this.deleteMany({ restaurant: restaurantId, user: userId });
    } catch (error) {
      throw error;
    }
  },

};


/**
 * @typedef BlockedUser
 */
module.exports = mongoose.model('BlockedUser', blockedUserSchema);
