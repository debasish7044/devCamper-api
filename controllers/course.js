const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponce = require('../utils/errorResponce');
const asyncHandler = require('../middleware/async');

//@desc  Get all courses
//@route GET /api/v1/courses
//@route GET /api/v1/bootcamps/:bootcampId/courses
//@access public

exports.getCourses = asyncHandler(
  async (req, res, next) => {
    if (req.params.bootcampId) {
      const courses = Course.find({
        bootcamp: req.params.bootcampId,
      });
      return res.status(200).json({
        success: true,
        count: (await courses).length,
        data: courses,
      });
    } else {
      res.status(200).json(res.advancedResults);
    }
  }
);

//@desc  Get a single courses
//@route GET /api/v1/courses/:id
//@access public

exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(
    req.params.id
  ).populate({
    path: 'bootcamp',
    select: 'name description',
  });

  if (!course) {
    return next(
      new ErrorResponce(
        `course not found with the id of ${req.params.bootcampId}`,
        404
      )
    );
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

//@desc  Add course
//@route post GET /api/v1/bootcamps/:bootcampId/courses
//@access private

exports.addCourse = asyncHandler(async (req, res, next) => {
  //assigning bootcampId to req.body
  req.body.bootcamp = req.params.bootcampId;

  //adding user id to a particular course
  req.body.user = req.user.id;

  //finding bootcamp with bootcampId
  const bootcamp = await Bootcamp.findById(
    req.params.bootcampId
  );

  //checking existing
  if (!bootcamp) {
    return next(
      new ErrorResponce(
        `bootcamp not found with the id of ${req.params.bootcampId}`,
        404
      )
    );
  }

  //make sure bootcamp owner or admin
  if (
    bootcamp.user.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    console.log(bootcamp.user.toString());
    console.log(req.user._id);
    return next(
      new ErrorResponce(
        `Bootcamp with this id of  ${req.user.id} not authorize to add a course to this bootcamp `,
        401
      )
    );
  }

  const course = await Course.create(req.body);

  res.status(201).json({
    success: true,
    data: course,
  });
});

//@desc  Update a  courses
//@route GET /api/v1/courses/:id
//@access Private

exports.updateCourse = asyncHandler(
  async (req, res, next) => {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return next(
        new ErrorResponce(
          `course not found with the id of ${req.params.id}`,
          404
        )
      );
    }
    //make sure user course owner
    if (
      course.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ErrorResponce(
          `Bootcamp with this id of  ${req.user.id} not authorize to update this course ${course._id}`,
          401
        )
      );
    }

    course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: course,
    });
  }
);

//@desc  Delete a  course
//@route Delete /api/v1/courses/:id
//@access Private

exports.deleteCourse = asyncHandler(
  async (req, res, next) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return next(
        new ErrorResponce(
          `course not found with the id of ${req.params.id}`,
          404
        )
      );
    }

    //make sure user is course owner
    if (
      course.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ErrorResponce(
          `Bootcamp with this id of  ${req.user.id} not authorize to delete this course ${course._id}`,
          401
        )
      );
    }

    await course.remove();

    res.status(200).json({
      success: true,
    });
  }
);
