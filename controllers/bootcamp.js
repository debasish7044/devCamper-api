const path = require('path');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponce = require('../utils/errorResponce');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');

//@desc  Get all bootcamps
//@route GET /api/v1/bootcamps
//@access public

exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

//@desc  Get single bootcamp
//@route GET /api/v1/bootcamps/:id
//@access private
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponce(
        `bootcamp not found with the id of ${req.params.id}`,
        404
      )
    );
  }
  res.status(200).json({ success: true, data: bootcamp });
});

//@desc  create new a bootcamp
//@route POST /api/v1/bootcamps
//@access private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // add user to bootcamp
  req.body.user = req.user.id;

  //check publish for bootcamp
  const publishedBootcamp = await Bootcamp.findOne({
    user: req.user.id,
  });

  // if user is not admin they can only add one bootcamp
  if (publishedBootcamp && req.user.role !== 'admin') {
    return next(
      new ErrorResponce(
        `${req.user.role} only can add one bootcamp`,
        401
      )
    );
  }

  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({ success: true, data: bootcamp });
});

//@desc  update bootcamp
//@route PUT /api/v1/bootcamps
//@access private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponce(
        `bootcamp not found with the id of ${req.params.id}`,
        404
      )
    );
  }

  //make sure bootcamp owner or admin
  if (
    bootcamp.user.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponce(
        `User with this id of  ${req.params.id} not authorize to update this bootcamp `,
        401
      )
    );
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json({ success: true, data: bootcamp });
});

//@desc  delete bootcamp
//@route DELETE /api/v1/bootcamps/:id
//@access private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponce(
        `bootcamp not found with the id of ${req.params.id}`,
        404
      )
    );
  }
  //make sure bootcamp owner or admin
  if (
    bootcamp.user.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponce(
        `User with this id of  ${req.params.id} not authorize to delete this bootcamp `,
        401
      )
    );
  }

  bootcamp.remove();
  res.status(200).json({ success: true });
});

// @desc      Get bootcamps within a radius
// @route     GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access    Private
exports.getBootcampsInRadius = asyncHandler(
  async (req, res, next) => {
    const { zipcode, distance } = req.params;

    // Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // Calc radius using radians
    // Divide dist by radius of Earth
    // Earth Radius = 3,963 mi / 6,378 km
    const radius = distance / 3963;

    const bootcamps = await Bootcamp.find({
      location: {
        $geoWithin: { $centerSphere: [[lng, lat], radius] },
      },
    });

    res.status(200).json({
      success: true,
      count: bootcamps.length,
      data: bootcamps,
    });
  }
);

//@desc  Upload photo for bootcamp bootcamp
//@route Post /api/v1/bootcamps/:id/photo
//@access private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  //check if bootcamp is there
  if (!bootcamp) {
    return next(
      new ErrorResponce(
        `bootcamp not found with the id of ${req.params.id}`,
        404
      )
    );
  }
  //make sure bootcamp owner or admin
  if (
    bootcamp.user.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponce(
        `User with this id of  ${req.params.id} not authorize to upload photo in this bootcamp `,
        401
      )
    );
  }

  //check file is there
  if (!req.files) {
    return next(new ErrorResponce(`please upload a photo`, 404));
  }

  //check if it is photo
  const file = req.files.file;

  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponce(`please upload an image`, 404));
  }

  //check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponce(
        `please upload an image less then ${process.env.MAX_FILE_UPLOAD}`,
        404
      )
    );
  }

  //Create custom filename
  file.name = `photo_${req.params.id}${path.parse(file.name).ext}`;
  console.log(`${process.env.FILE_UPLOAD_PATH}/${file.name}`);

  file.mv(
    `${process.env.FILE_UPLOAD_PATH}/${file.name}`,
    async (err) => {
      if (err) {
        return next(
          new ErrorResponce(`problem with uploading photo`, 404)
        );
      }
      await Bootcamp.findByIdAndUpdate(req.params.id, {
        photo: file.name,
      });

      //sending responce
      res.status(200).json({ success: true, data: file.name });
    }
  );
});
