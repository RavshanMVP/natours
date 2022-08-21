import tourModel from '../models/tour model.js';

class ApiFeatures{
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr =queryStr;
  }

  filter(){
    //Filtering
    const { page, sort, limit, fields, ...queryObj } = this.queryStr;
    let queryStr = JSON.stringify(queryObj);
    queryStr = JSON.parse(
      queryStr.replace(/\b(gte?|lte?)\b/g, (match) => `$${match}`)
    );
    this.query.find(queryStr);
    return this;
  }

  sort(){
    const { page, sort, limit, fields, ...queryObj } = this.queryStr;
    //Sorting
    if (sort) {
      const sortBy = sort.replaceAll(',', ' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  limit(){
    //Limiting
    const { page, sort, limit, fields, ...queryObj } = this.queryStr;
    if (fields) {
      const limitField = fields.replaceAll(',', ' ');
      this.query = this.query.select(limitField);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  async paginate(){
    //Pagination
    const { page, sort, limit, fields, ...queryObj } = this.queryStr;
    const pagination = { page: page, limit: limit };
    pagination.page = page || 1;
    pagination.limit = limit || 5;
    const skip = (pagination.page - 1) * pagination.limit;
    if (page) {
      const numTours = await tourModel.countDocuments();
      if (skip >= numTours) {
        throw new Error("The page doesn't exist");
      }
    }
    this.query = this.query.skip(skip).limit(pagination.limit);
    return this;
  }
}

export default ApiFeatures;