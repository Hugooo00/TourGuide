const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');

// const validator = require('validator');

// create and describe a schema
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'], // build-in Validators
      unique: true, // not a Validator
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 50 characters'], // build-in Validators
      minlength: [10, 'A tour name must have more or equal then 10 characters'], // build-in Validators
      // validate: [validator.isAlpha, 'A Tour Name must only contain character'],
    },
    slug: String,
    duration: { type: Number, required: [true, 'A tour must have a duration'] },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficluty is either easy, medium and difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, // 4.666 ,46.6666, 4.7
    },
    ratingsQuantity: { type: Number, default: 0 },
    price: { type: Number, required: [true, 'A tour must have a price'] },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // "this" only points to current doc on NEW document creation
          return val < this.price; // 300 < 200 will return false and trigger validation err
        },
        message: 'Discount price ({VALUE}) should be below regular price', // {VALUE}可直接获取priceDiscount的数值
      },
    },
    summary: {
      type: String,
      trim: true,
      require: [true, 'A tour must have a summary'],
    }, // trim会删除段落前面和后面没用的空格
    description: { type: String, trim: true },
    imageCover: {
      type: String,
      required: [true, 'A tour must have cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date], // 比如输入"2021-03-21,11:32" ，会通过mongodb自动转化为javascript的格式
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        // type: String,
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Index
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 }); // use the unique slug to query for tours.
tourSchema.index({ startLocation: '2dsphere' });

// define virtual Properties
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7; //  "this" is point to the currently process document
});

// Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', // 指的是Review里的tour field
  localField: '_id',
});

// Document middleware: runs before the .save() and .create()
tourSchema.pre('save', function (next) {
  // console.log(this);s
  this.slug = slugify(this.name, { lower: true }); //  "this" is point to the currently process document
  next();
});

// add guides information to the guide fields
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   console.log(this.guides);
//   next();
// });

// tourSchema.pre('save', function (next) {
//   console.log('Will save document...');
//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// Query Middleware
// /^find/ means all the strings start with find
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } }); // "this" points to query
  this.start = Date.now();
  next();
});

// populate tours in guides filed
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangeAt',
  });

  next();
});

tourSchema.post(/^find/, function (docs, next) {
  // 计算执行时间
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  //   console.log(docs);
  next();
});

// Aggregation Middleware
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   console.log(this.pipeline()); //"this" points to Aggregation object
//   next();
// });

// create a model: always use uppercase in model
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
