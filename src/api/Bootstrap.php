<?php
namespace api;

class Bootstrap {
    public static $root;

    public static function setRoot(string $root) {
        self::$root = $root;
    }
}