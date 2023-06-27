const express = require("express");
const { createTodo, gettodo, deleteTodo } = require("../controllers/todoController");
const router=express.Router()
const auth = require("../middlewares/authMiddleware");

router.route("/createTodo").post(auth,createTodo);
router.route("/gettodo").get(auth,gettodo);
router.route("/remove").delete(auth,deleteTodo);
module.exports= router