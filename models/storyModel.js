const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Story title is required'],
        unique: false,  // اجعلي `unique` بـ false أو احذفيه تمامًا

    },
    imageCover: {
        type: String,
      },
    images: [String],
    category: {
        type: mongoose.Schema.ObjectId,
        ref: "Category",
        required: [true, "Story must belong to a category"],
      },
    subCategory: {
        type: mongoose.Schema.ObjectId,
        ref: 'subCategory',
        required: [true, 'Story must belong to a subCategory']
    },
    isRead: {
        type: Boolean,
        default: false
    },
  
}, { timestamps: true });



const setImageURL = (doc) => {
  if (doc.imageCover && !doc.imageCover.startsWith(process.env.BASE_URL)) {
      const imageUrl = `${process.env.BASE_URL}/stories/${doc.imageCover}`;
      doc.imageCover = imageUrl;
  }
  if (doc.images) {
      const imagesList = [];
      doc.images.forEach((image) => {
          const imageUrl = image.startsWith(process.env.BASE_URL) 
              ? image 
              : `${process.env.BASE_URL}/stories/${image}`;
          imagesList.push(imageUrl);
      });
      doc.images = imagesList;
  }
};

  // findOne, findAll and update
  storySchema.post('init', (doc) => {
    setImageURL(doc);
  });
  
  // create
  storySchema.post('save', (doc) => {
    setImageURL(doc);
  });
  
     
const StoryModel = mongoose.model('Story', storySchema);
module.exports = StoryModel;
 