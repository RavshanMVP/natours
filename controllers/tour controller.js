import tourModel from '../models/tour model.js';
import ApiFeatures    from '../utils/apiFeatures.js';
import { catchAsync } from '../utils/catchAsync.js';
import appError       from '../utils/appError.js';

function aliasTopTours(req, res, next) {
  //function to get 5 cheapest tours
  req.query.limit = 5;
  req.query.sort = 'price, -ratingsAverage';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
}

const getAll = catchAsync(async (req, res, next) => {
    const help = new ApiFeatures(tourModel.find(), req.query);
    (await help.filter().paginate()).sort().limit();
    // these methods are called from utils class to modify data based on queries

    const models = await help.query; // getting all queries
    res.status(200).json({
      status: 'success',
      data: { tours: models },
    });
});

const getModel = catchAsync(async (req, res, next) => {
    const model = await tourModel.findById(req.params.id); // get one model
    if(!model) return next(new appError("No tour with this id", 404));
    res.status(200).json({
      status: 'success',
      data: { tour: model },
    });
});

const deleteModel = catchAsync (async (req, res, next) => {
  const model =await tourModel.findByIdAndDelete(req.params.id); //getting one model and then deleting it
  if(!model) return next(new appError("No tour with this id", 404));
  res.json().status(200);
});

const updateModel = catchAsync (async (req, res, next) => {
    const editedModel = await tourModel.findByIdAndUpdate(
      req.params.id, //getting the model by id
      req.body, // changing to the new content
      {
        new: true,
        runValidators: true, //we run the same validators for update as for create
      }
    );
  if(!editedModel) return next(new appError("No tour with this id", 404));
    res
      .json({
        status: 'Success',
        data: editedModel,
      })
      .status(204);
});

const createModel = catchAsync(async (req, res, next) => {
    const newTour = await tourModel.create(req.body); //creating a model
    res.status(201).json({
      status: 'Success',
      data: { tour: newTour },
    });
});

const getTourStats = catchAsync(async (req, res, next) => {
    const stats = await tourModel.aggregate([
      {
        $match: { ratingAverage: { $gte: 2.5 } }, // match = if
      },
      {
        $group: {
          _id: '$difficulty', //we group stats based on their difficulty
          totalTours: { $sum: 1 },
          numRatings: { $sum: '$ratingQuantity' },
          avgRate: { $avg: '$ratingAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }, // using aggregate options for stats
        },
      },
      {
        $sort: {
          // sorting py price in descending order
          avgPrice: -1,
        },
      },
    ]);
    res.status(200).json({
      status: 'Success',
      data: { stats },
    });
});

const getMonthlyPlan =catchAsync(async (req, res, next) => {
  const year = req.params.year;
  const plan = await tourModel.aggregate([
    {
      $unwind: '$startDates', // divide our tours if they have several dates
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`), // checking if the tours will happen this year
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' }, // we're grouping plans by months
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }, // sowing the array of tours displaying their name
      },
    },
    {
      $sort: {
        _id: 1, // sort by month in ascending order
      },
    },
    {
      $addFields: {
        month: `$_id`, // replacing the word "id" to "month" for easier understanding
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
  ]);
  try {
    res.status(200).json({
      status: 'Success',
      data: { plan },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
});

export default {
  getAll,
  getMonthlyPlan,
  getTourStats,
  getModel,
  updateModel,
  createModel,
  deleteModel,
  aliasTopTours
}