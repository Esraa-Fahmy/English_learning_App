const mongoose = require('mongoose');
const subCategoryModel = require('./subCategoryModel');
const StoryModel = require('./storyModel');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category required'],
        unique: [true, 'Category name must be unique'],
        minlength: [3, 'Too short category name'],
        maxlength: [40, ' Too long Category name'],
    },
    slug: {
        type: String,
        lowercase: true,
    },
    image: {
        type: String,
        require: true,
    },
    
}, {timestamps : true}
);


const setImageURL = (doc) => {
    if (doc.image) {
      const imageUrl = `${process.env.BASE_URL}/categories/${doc.image}`;
      doc.image = imageUrl;
    }
  };
  // findOne, findAll and update
  categorySchema.post('init', (doc) => {
    setImageURL(doc);
  });
  
  // create
  categorySchema.post('save', (doc) => {
    setImageURL(doc);
  });



  categorySchema.pre("findOneAndDelete", async function (next) {
    const categoryId = this.getQuery()._id;
  
    // حذف كل الـ subCategories المرتبطة بالـ Category المحذوفة
    await subCategoryModel.deleteMany({ category: categoryId });
  
    // حذف كل الـ Stories المرتبطة بالـ Category المحذوفة
    await StoryModel.deleteMany({ category: categoryId });
  
    next();
  });


const CategoryModel = mongoose.model('Category', categorySchema)

module.exports = CategoryModel;