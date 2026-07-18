import { Router } from "express";

const router = Router();

router.get("/amIWorthy", (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.json({ user });
});

export default router;
