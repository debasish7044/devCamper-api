const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

//Load env vars
dotenv.config({ path: './config/config.env' });

//Load models
const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');
const User = require('./models/User');
const Review = require('./models/Review');

//connect mongoose to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

//read json file
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`)
);
const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`)
);
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users.json`)
);

const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/reviews.json`)
);

//Import into DB
const importData = async () => {
  try {
    await User.create(users);
    await Bootcamp.create(bootcamps);
    await Course.create(courses);
    await Review.create(reviews);
    console.log('imported data to database...'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(error);
  }
};

//delete data from DB
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Bootcamp.deleteMany();
    await Course.deleteMany();
    await Review.deleteMany();
    console.log('all data has been deleted'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(error);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
