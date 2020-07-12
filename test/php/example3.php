<?php
require_once __DIR__ . "/../../autoload@module.php";
require_once __DIR__ . "/../autoload@bare.php";

use api\Synapse;
use api\debugger\Debugger;

Synapse::match(".*", function() {
    // Debugger::log("2323");
    // Debugger::error("4444");
    // Debugger::map([
    //     "a" => 55,
    //     "b" => [
    //         "sas" => 4
    //     ],
    //     "c" => [1, 2, 3]
    // ]);
    // Debugger::table([
    //     "age", "name"
    // ],
    // [
    //     "12", "22"
    // ]);
    // Debugger::trap(function () {
    //     throw new \Exception("sa");
    // });
    Synapse::response([
        "debug" => Debugger::export()
    ]);
});

    // Debugger::log
    // Debugger::warning
    // Debugger::error
    // Debugger::map
    // Debugger::table
    // Debugger::trap
    // Debugger::export