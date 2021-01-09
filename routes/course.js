const express = require('express');

const {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/course');

//course model
const Course = require('../models/Course');

const router = express.Router({ mergeParams: true });

// protect auth middleware
const {
  protect,
  authorize,
} = require('../middleware/auth');

//advancedResult
const advancedResults = require('../middleware/advancedResult');

router
  .route('/')
  .get(
    advancedResults(Course, {
      path: 'bootcamp',
      select: 'name description',
    }),
    getCourses
  )
  .post(
    protect,
    authorize('publisher', 'admin'),
    addCourse
  );

router
  .route('/:id')
  .get(getCourse)
  .put(
    protect,
    authorize('publisher', 'admin'),
    updateCourse
  )
  .delete(
    protect,
    authorize('publisher', 'admin'),
    deleteCourse
  );

module.exports = router;
