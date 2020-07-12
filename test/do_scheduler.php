<?php

use api\Bootstrap;
use api\schedule\ScheduleDoer;

require_once __DIR__ . "/../../autoload@module.php";
require_once __DIR__ . "/MyTask.php";

Bootstrap::setRoot(".");
ScheduleDoer::do();