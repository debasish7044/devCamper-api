const path = require('path');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const colors = require('colors');
const express = require('express');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const bootcamps = require('./routes/bootcamp');
const courses = require('./routes/course');
const auth = require('./routes/auth');
const user = require('./routes/user');
const review = require('./routes/review');
const morgan = require('morgan');
const fileupload = require('express-fileupload');
const connectDB = require('./config/db');
const errorHandlers = require('./middleware/error');
const asyncHandler = require('./middleware/async');
const app = express();

//Load env vars
dotenv.config({ path: './config/config.env' });
connectDB();

//body parse for getting req.body
app.use(express.json());

//cookie parser
app.use(cookieParser());

//morgan for getting url
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//file uploading
app.use(fileupload());

//sanitize data
app.use(mongoSanitize());

//header security
app.use(helmet());

//prevent xss attacks
app.use(xss());

//rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// apply to all requests
app.use(limiter);

//prevent http params polution
app.use(hpp());

//enable cors
app.use(cors());

//set static folder
app.use(express.static(path.join(__dirname, 'public')));

//Mount Routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', user);
app.use('/api/v1/reviews', review);
app.use(errorHandlers);
app.use(asyncHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () =>
  console.log(`server is running on ${PORT}`)
);

//Handled unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);

  //close server and exit process
  server.close(() => process.exit(1));
});
