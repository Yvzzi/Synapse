<?php
namespace api\schedule;

use api\Bootstrap;

class ScheduleDoer {
    public static $path;

    public static function do() {
        self::$path = Bootstrap::$root;
        if (file_exists(self::$path . "/scheduler.json"))
            $scheduler = json_decode(file_get_contents(self::$path . "/scheduler.json"), true);
        else return;
        foreach ($scheduler as $affair) {
            if ($affair["type"] === "at") {
                if (time() >= $affair["time"]) {
                    self::trigger($affair["name"], $affair["target"]);
                    Scheduler::remove($affair["name"]);
                }
            } else {
                $time = array_reverse($affair["time"]);
                $len = count($time);
                $dateTime = new \DateTime("now", new \DateTimeZone("+0800"));
                $now = null;
                $flag = true;
                for ($i = 0; $i < $len; $i++) {
                    switch ($i) {
                        case 0:
                            $now = $dateTime->format("w");
                        break;
                        case 1:
                            $now = $dateTime->format("m");
                        break;
                        case 2:
                            $now = $dateTime->format("d");
                        break;
                        case 3:
                            $now = $dateTime->format("H");
                        break;
                        case 4:
                            $now = $dateTime->format("i");
                        break;
                    }
                    $now = intval($now);
                    $flag = $flag && in_array($now, self::analyse($time[$i], $i));
                }
                if ($flag) {
                    self::trigger($affair["name"], $affair["target"]);
                }
            }
        }
    }

    private static function analyse(string $time, int $type): array {
        if (preg_match("/^\\d+-\\d+$/", $time)) {
            [$left, $right] = explode("-", $time);
            return range($left, $right);
        } elseif (preg_match("/^\\d+-\\d+\\/\\d+$/", $time)) {
            [$left, $right] = explode("-", $time);
            [$right, $step] = explode("/", $right);
            return self::getRange($type, (int) $left, (int) $right, (int) $step);
        } elseif (preg_match("/^\\*\\/\\d+$/", $time)) {
            [, $step] = explode("/", $time);
            return self::getRange($type, null, null, (int) $step);
        } elseif (preg_match("/^\\*$/", $time)) {
            return self::getRange($type, null, null);
        } elseif (preg_match("/^\\d+(,\\d+)+$/", $time)) {
            return array_map("\\intval", explode(",", $time));
        } else {
            return [(int) $time];
        }
    }

    private static function getRange(int $type, int $left = null, int $right = null, int $step = 1): array {
        if ($left === null || $right === null) {
            switch ($type) {
                case 0:
                    $left = $left ?? 1;
                    $right = $right ?? 7;
                break;
                case 1:
                    $left = $left ?? 1;
                    $right = $right ?? 12;
                break;
                case 2:
                    $left = $left ?? 1;
                    $right = $right ?? 31;
                break;
                case 3:
                    $left = $left ?? 0;
                    $right = $right ?? 23;
                break;
                case 4:
                    $left = $left ?? 0;
                    $right = $right ?? 59;
                break;
            }
        }
        $range = [];
        for ($i = $left; $i <= $right; $i += $step) {
            array_push($range, $i);
        }
        return $range;
    }

    private static function trigger(string $name, string $target) {
        ob_start();
        try {
            if (strpos($target, "@") === false) {
                $reflectionFunction = new \ReflectionFunction($name);
                $reflectionFunction->invoke(null);
            } else {
                [$namespace, $method] = explode("@", $target);
                $namespace = str_replace("/", "\\", $namespace);
                $reflectionClass = new \ReflectionClass($namespace);
                $reflectionMethod = $reflectionClass->getMethod($method);
                $reflectionMethod->invoke(null);
            }
        } catch (\Throwable $e) {
            echo $e->__toString();
        }
        $output = ob_get_clean();
        self::log($name, $output);
    }

    private static function log(string $name, string $output) {
        if (!file_exists(self::$path . "/scheduler_log/"))
            mkdir(self::$path . "/scheduler_log/", 0755);
        $logPath = self::$path . "/scheduler_log/{$name}.log";
        if (!file_exists($logPath))
            file_put_contents($logPath, "");
        $dateTime = new \DateTime("now", new \DateTimeZone("+0800"));
        $buf = "==== " . $dateTime->format("Y-m-d/H:i:s") . " ====\n";
        $buf .= $output . "\n";
        $buf .= "=============================\n\n";
        file_put_contents($logPath, file_get_contents($logPath) . $buf);
    }
}