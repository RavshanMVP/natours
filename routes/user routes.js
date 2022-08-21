import express        from 'express';
import authController from '../controllers/authController.js';
import userController from '../controllers/userController.js';

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/", userController.getAll);

export default router;