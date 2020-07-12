<?php
namespace api;

class Synapse {
    /** @var string|\Closure */
    public static function match(string $apiPattern, $callback) {
        $api = $_GET["api"];
        $pattern = str_replace("/", "\\/", $apiPattern);
        $pattern = preg_replace("/\\{!\\w+\\}/", "(\\w+)", $pattern);
        if (!preg_match("/$pattern/", $api)) {
            return;
        }
        $paramKeys = [];
        $left = 0;
        $len = strlen($apiPattern);
        while ($left < $left && ($left = strpos($apiPattern, "{", $left)) !== false) {
            if ($left + 2 >= strlen($apiPattern) || substr($apiPattern, $left + 1, $left + 2) != "!") {
                $left += 2;
                continue;
            }
            $right = strpos($apiPattern, "}", $left);
            if ($right === false || $right < $left) continue;
            array_push($paramKeys, substr($apiPattern, $left + 2, $right - $left - 2));
            $left = $right + 1;
        }
        preg_match_all("/$pattern/", $api, $paramValues);
        $paramValues = $paramValues[1] ?? [];
        $params = [];
        for ($i = 0; $i < count($paramKeys); $i++) {
            $params[$paramKeys[$i]] = $paramValues[$i];
        }

        // var_dump($params);
        // exit;
        if (is_string($callback))
            $callback = str_replace("\\", "/", $callback);

        if ($callback instanceof \Closure) {
            $callback(...$paramValues);
        } elseif (($index = strpos($callback, "@")) !== false) {
            $class = substr($callback, 0, $index);
            $method = substr($callback, $index + 1);
            $reflectionClass = new \ReflectionClass($class);
            $reflectionMethod = $reflectionClass->getMethod($method);
            $reflectionParameters = $reflectionMethod->getParameters();
            $args = [];

            foreach ($reflectionParameters as $reflectionParameter) {
                $args[$reflectionParameter->getPosition()] = $params[$reflectionParameter->getName()];
            }
            $reflectionMethod->invokeArgs(null, $args);
        } else {
            $reflectionFunction = new \ReflectionFunction($callback);
            $reflectionParameters = $reflectionFunction->getParameters();
            $args = [];
            foreach ($reflectionParameters as $reflectionParameter) {
                $args[$reflectionParameter->getPosition()] = $params[$reflectionParameter->getName()];
            }
            $reflectionFunction->invokeArgs($args);
        }
    }

    /** @return mixed|array */
    public static function filter(string $name = null, $default = null) {
        if ($name) return $_GET[$name] ?? $default;
        return $_GET;
    }

    /** @return mixed|array */
    public static function data(string $name = null, $default = null) {
        if ($name) return $_POST[$name] ?? $default;
        return $_POST;
    }

    /** @return string|false */
    public static function raw() {
        return file_get_contents("php://input");
    }

    /** @return mixed|array */
    public static function file(string $name = null, $default = null) {
        if ($name) return $_FILES[$name] ?? $default;
        return $_FILES;
    }

    public static function response(array $json): void {
        header("Content-Type: application/json");
        echo json_encode($json);
    }

    public static function redirect(string $namespace): void {
        require_once $namespace;
    }
}