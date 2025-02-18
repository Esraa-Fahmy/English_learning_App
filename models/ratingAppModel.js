const mongoose = require('mongoose');

const appRatingSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: [1, 'Min rating value is 1'],
      max: [5, 'Max rating value is 5'],
      required: [true, 'Rating is required'],
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Rating must belong to a user'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AppRating', appRatingSchema);
