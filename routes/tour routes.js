import express from 'express';
import tours from '../controllers/tour controller.js';
import authController from '../controllers/authController.js';
const router = express.Router();

// router.param('id', (req, res, next, value) => {
//
// });

router.route('/top-5-cheap').get(authController.protect, tours.aliasTopTours, tours.getAll);


router.route('/stats').get(authController.protect, tours.getTourStats);

router.route('/plan/:year').get(authController.protect, tours.getMonthlyPlan);


router.get('/', authController.protect, tours.getAll);

router.post('/', authController.protect, tours.createModel);

router
  .route('/:id')
  .get(authController.protect,tours.getModel)
  .patch(authController.protect, tours.updateModel)
  .delete(authController.protect, tours.deleteModel);

export default router;
