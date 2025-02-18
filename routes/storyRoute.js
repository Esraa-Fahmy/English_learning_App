const express = require("express");
const {
  createStory,
  updateStory,
  markStoryAsRead,
  unmarkStoryAsRead,
  getAllStories,
  uploadStoryImages,
  resizeStoryImages,
  getStory,
  deleteStory,
} = require("../controllers/storyController");
const {
  createStoryValidator,
  getStoryValidator,
  updateStoryValidator,
  deleteStoryValidator,
} = require("../validators/storyValidator");

const Auth = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(getAllStories)
  .post(
    Auth.protect,
    Auth.allowedTo("admin"),
    uploadStoryImages,
    resizeStoryImages,
    createStoryValidator,
    createStory
  );

router
  .route("/:id")
  .get(getStoryValidator, getStory)
  .put(
    Auth.protect,
    Auth.allowedTo("admin"),
    uploadStoryImages,
    resizeStoryImages,
    updateStoryValidator,
    updateStory
  )
  .delete(
    Auth.protect,
    Auth.allowedTo("admin"),
    deleteStoryValidator,
    deleteStory
  );

//router.route("/:id/next").get(getNextStory);
//router.route("/:id/previous").get(getPreviousStory);
router.patch("/:storyId/mark-as-read", Auth.protect, markStoryAsRead);
router.patch("/:storyId/unmark-as-read", Auth.protect, unmarkStoryAsRead);

module.exports = router;
