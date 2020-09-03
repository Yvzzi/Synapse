<?php
namespace api;

try_require_once(inner() . "/lib/autoload@lib.php");
try_require_once(module() . "/lib/autoload@lib.php");

class Bootstrap {
    public static $root;

    public static function setRoot(string $root) {
        self::$root = $root;
    }
}