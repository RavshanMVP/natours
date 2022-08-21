import { catchAsync } from '../utils/catchAsync.js';
import ApiFeatures    from '../utils/apiFeatures.js';
import UserModel      from '../models/user model.js';

const getAll = catchAsync(async (req, res, next) => {
  const help = new ApiFeatures(UserModel.find(), req.query);
  (await help.filter().paginate()).sort().limit();
  // these methods are called from utils class to modify data based on queries

  const models = await help.query; // getting all queries
  res.status(200).json({
    status: 'success',
    data: { tours: models },
  });
});

export default {
  getAll
}