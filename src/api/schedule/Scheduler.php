<?php
namespace api\schedule;

use api\Bootstrap;

class Scheduler {
    private static $scheduler = null;
    private static $schedulerPath = null;

    public static function loadScheduler(string $schedulerPath) {
        self::$schedulerPath = $schedulerPath;
        if (self::$scheduler === null) {
            if (!file_exists($schedulerPath))
                file_put_contents($schedulerPath, "[]");
            self::$scheduler = json_decode(file_get_contents($schedulerPath), true);
        }
    }

    public static function remove(string $name): void {
        $scheduler = [];
        foreach (self::$scheduler as $s) {
            if ($s["name"] !== $name)
                array_push($scheduler, $s);
        }
        self::$scheduler = $scheduler;
        file_put_contents(self::$schedulerPath, json_encode(self::$scheduler));
    }

    /**
     * @param array $time
     * @example
     *
     *  minute hour day month week
     *  *       *   *   *       *
     *
     *  Format: * | 1,2 | 5-9 | * / 1 | 1-2 / 1
     */
    public static function repeat(string $name, array $time, string $target): void {
        if (count($time) !== 5)
            throw new \InvalidArgumentException("Invalid argument of time");
        foreach ($time as $t) {
            if (!preg_match("/^(\\*|\\d+-\\d+|\\d+-\\d+\\/\\d+|\\*\\/\\d+|\\d+(,\\d+)+)$/", $t))
                throw new \InvalidArgumentException("Invalid argument of time");
        }
        array_push(self::$scheduler, [
            "name" => $name,
            "type" => "repeat",
            "time" => $time,
            "target" => $target
        ]);
        file_put_contents(self::$schedulerPath, json_encode(self::$scheduler));
    }

    public static function at(string $name, $time, string $target): void {
        if (!is_numeric($time))
            $time = strtotime($time);
        else $time = (int) $time;
        if ($time === false)
            throw new \InvalidArgumentException("Invalid argument of time");
        array_push(self::$scheduler, [
            "name" => $name,
            "type" => "at",
            "time" => $time,
            "target" => $target
        ]);
        file_put_contents(self::$schedulerPath, json_encode(self::$scheduler));
    }
}
Scheduler::loadScheduler(Bootstrap::$root . "/scheduler.json");