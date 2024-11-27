const express = require('express');

const AuthUser = require('../controller/AuthUser');
const Projects = require('../controller/ProjectCtrl');
const Sidebar = require('../controller/sidebarCtrl');
const Workspace = require('../controller/sidebarCtrl');
const client = require('../controller/ClientCtrl');
const Activity = require('../controller/ActivityLogsCtrl');
const Milestones = require('../controller/MileStoneCtrl');
const Routine = require('../controller/RoutineCtrl');
const Task = require('../controller/TaskCtrl');
const comment = require('../controller/CommentsCtrl');
const Medicine = require('../controller/MedicineCtrl');
const Settings = require('../controller/SettingCtrl');
const statusData = require('../controller/StatusCtrl');

const router = express.Router();

router.use('/', AuthUser);
router.use('/', Sidebar);
router.use('/', Projects);
router.use('/', Workspace);
router.use('/', client);
router.use('/', Activity);
router.use('/', Milestones);
router.use('/', Routine);
router.use('/', Task);
router.use('/', comment);
router.use('/', Medicine);
router.use('/', Settings);
router.use('/', statusData);

module.exports = router;
