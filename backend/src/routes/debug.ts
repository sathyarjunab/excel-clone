import { Router } from "express";
import { DB } from "../db/pool.js";

const debugRoute = Router();

debugRoute.get("/test", async (req, res) => {
  console.log(req.user);
  res.status(200).send({ message: "done" });
});

export default debugRoute;
