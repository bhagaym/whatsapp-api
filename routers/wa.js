const express = require("express");
const controller = require("../controllers/waController");
const router = express.Router();

router.get("/send_to_contact", controller.send_to_contact);
router.get("/send_to_group", controller.send_to_group);
router.get("/group_list", controller.group_list);

module.exports = router;