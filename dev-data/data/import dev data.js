import dotenv from 'dotenv';
import mongoose from 'mongoose';
import * as fs from 'fs';
import tourModel from '../../models/tour model.js';
import * as path from 'path';
dotenv.config({
  path: './config.env',
});

const DB = process.env.DATABASE;

mongoose.connect(DB).then(() => {
  console.log('Mongo DB is connected successfully');
});

const files = JSON.parse(fs.readFileSync('./dev-data/data/tours-simple.json', 'utf-8'));

const importData = async ()=>{
  try {
    await tourModel.create(files);
    console.log("Data was created");
  }
  catch (e) {
    console.log(e);
  }
}

const deleteData = async ()=>{
  try {
    await tourModel.deleteMany();
    console.log("Data was deleted");
  }
  catch (e) {
    console.log(e);
  }
}