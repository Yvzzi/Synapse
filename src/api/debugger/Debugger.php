<?php
namespace api\debugger;

use neutron\packet\PacketUtil;
use neutron\router\Response;

class Debugger {
    protected $response;
    protected $util;
    /** @var Debugger */
    protected static $instance = null;

    protected function __construct() {
        $this->response = new Response();
        $this->response->data = [
            "debug" => []
        ];
        $this->util = new PacketUtil($this->response);
    }

    protected static function debugger() {
        if (self::$instance === null)
            self::$instance = new Debugger();
        return self::$instance;
    }

    public static function export() {
        return self::debugger()->response->data["debug"];
    }

    public static function log(string $data) {
        return self::debugger()->util->log($data);
    }

    public static function dump($var) {
        return self::debugger()->util->dump($var);
    }

    public static function error(string $data) {
        return self::debugger()->util->error($data);
    }

    public static function warning(string $data) {
        return self::debugger()->util->warning($data);
    }

    public static function map($data) {
        return self::debugger()->util->map($data);
    }

    public static function table($header, $body) {
        return self::debugger()->util->table($header, $body);
    }

    public static function trap(\Closure $closure) {
        return self::debugger()->util->trap($closure);
    }
}