import mongoose  from 'mongoose';
import validator from 'validator';
import slugify   from 'slugify';

const TourSchema = new mongoose.Schema(
  {
    name: {
      required: [true, 'A tour must have a name'],
      type: String,
      unique: true,
      maxLength: [40, "A tour's name max length is 40"],
      minLength: [10, "A tour's name min length is 10"],
    },
    // slug:String,
    price: {
      required: [true, 'A tour must have a price'],
      type: Number,
    },
    priceDiscount: {
      type: Number,
      validate: {
        //check if discount is greater than actual price
        // works only with .create()
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount price cannot be greater than normal price',
      },
    },
    ratingAverage: {
      type: Number,
      default: 3,
      min: [1, 'Rating must be greater than 1.0'],
      max: [5, 'Rating must be less than 5.0'],
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    duration: {
      required: [true, 'A tour must have a duration'],
      type: Number,
    },
    maxGroupSize: {
      required: [true, 'A tour must have a group size'],
      type: Number,
    },
    difficulty: {
      type: String,
      required: true,
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty can be one of these: easy medium difficult',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
  },
  {
    //options to display virtual properties
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  }
);

// virtual variable that is generated during the request
TourSchema.virtual('durationWeeks').get(function () {
  if (this.duration) {
    return this.duration / 7;
  }
});

// MIDDLEWARES

// //runs before .save() and .create()
// TourSchema.pre("save",function(next){
//   this.slug = slugify(this.name, {lower:true});
//   next();
// })
//
// //runs after .save() and .create()
// TourSchema.post("save",function(doc, next){
//   console.log(doc)
//   next();
// })

TourSchema.pre('aggregate', function (next) {
  console.log(this.pipeline());
  next();
});

// adding new collection 'tours' in MongoDB
const Tour = mongoose.model('Tour', TourSchema);

export default Tour;
