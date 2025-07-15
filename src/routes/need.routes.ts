import { Router } from "express";
import { NeedController } from "../controllers/need.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { Role } from "@prisma/client";

const router = Router();

// Get all needs for user (care home)
router.get(
  "/",
  authenticate,
  authorize([Role.CAREHOME]),
  NeedController.getAllNeeds
);

// Get needs for a specific user (care home profile view)
router.get("/user/:userId", authenticate, NeedController.getUserNeeds);

router.get("/:id", authenticate, NeedController.getNeedById);

router.post(
  "/",
  authenticate,
  authorize([Role.CAREHOME]),
  NeedController.createNeed
);

router.put(
  "/:id",
  authenticate,
  authorize([Role.CAREHOME]),
  NeedController.updateNeed
);

router.delete(
  "/:id",
  authenticate,
  authorize([Role.CAREHOME]),
  NeedController.deleteNeed
);
// Get needs for a specific care home (for donors)
router.get(
  "/carehome/:careHomeId",
  authenticate,
  NeedController.getCareHomeNeeds
);

export default router;
