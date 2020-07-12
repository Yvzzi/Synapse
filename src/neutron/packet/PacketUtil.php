<?php
namespace neutron\packet;

use neutron\router\Response;

class PacketUtil {
    private $response;

    public function __construct(Response $response) {
        $this->response = $response;
    }

    public function dump($var): PacketUtil {
        array_push($this->response->data["debug"], Response::html($this->response->info($var), Response::LIGHT_GREEN));
        return $this;
    }

    public function log(string $data): PacketUtil {
        array_push($this->response->data["debug"], Response::html($data, Response::LIGHT_GREEN));
        return $this;
    }

    public function error(string $data): PacketUtil {
        array_push($this->response->data["debug"], Response::html($data, Response::PINK));
        return $this;
    }

    public function warning(string $data): PacketUtil {
        array_push($this->response->data["debug"], Response::html($data, Response::ORANGE));
        return $this;
    }

    /** @param object|array */
    public function map($data): PacketUtil {
        $buf = "";
        if (is_object($data)) {
            $newData = [];
            foreach (get_object_vars($data) as $key => $value) {
                $newData[$key] = $value;
            }
            $buf .= Response::html("# ", Response::PURPLE) . Response::html(get_class($data), Response::LIGHT_BLUE);
            $data = $newData;
        } else {
            $buf .= Response::html("# ", Response::PURPLE) . Response::html("array", Response::LIGHT_BLUE);
        }
        $buf .= "<div data-net=\"tree-root\">";
        $buf .= self::arrayToMapTree($data);
        $buf .= "</div>";
        array_push($this->response->data["debug"], $buf);
        return $this;
    }

    private static function arrayToMapTree(array $data): string {
        $buf = "";
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $key = Response::html($key, Response::LIME);
                if (array_keys($value) === array_keys(array_keys($value))) {
                    $buf .= "<div data-net=\"tree-text\">{$key}</div>";
                    $buf .= "<div data-net=\"tree-node\">";
                    foreach ($value as $v) {
                        $buf .= "<div>{$v}</div>";
                    }
                    $buf .= "</div>";
                } else {
                    $buf .= "<div data-net=\"tree-text\">{$key}</div><div data-net=\"tree-node\">";
                    $buf .= self::arrayToMapTree($value);
                    $buf .= "</div>";
                }
            } else if (is_object($value)) {
                $key = Response::html($key . ":", Response::DEEP_ORANGE);
                $class = get_class($value);
                $buf .= "<div>{$key} {$class}</div>";
            } else {
                $key = Response::html($key . ":", Response::DEEP_ORANGE);
                $buf .= "<div>{$key} {$value}</div>";
            }
        }
        return $buf;
    }

    public function table(array $head, array $table): PacketUtil {
        $buf = "";
        $buf .= "<table data-net=\"table\"><tr>";
        foreach ($head as $h) {
            $buf .= "<th>{$h}</th>";
        }
        $buf .= "</tr>";
        foreach ($table as $row) {
            $buf .= "<tr>";
            foreach ($row as $value) {
                $buf .= "<td>{$value}</td>";
            }
            $buf .= "</tr>";
        }
        $buf .= "</table>";
        array_push($this->response->data["debug"], $buf);
        return $this;
    }

    public function trap(\Closure $closure): PacketUtil {
        try {
            $closure();
        } catch (\Throwable $th) {
            $buf = $th->getMessage() . "\n"
                . get_class($th) . " thrown(" . $th->getCode() . ") at "
                .  str_replace("\\", "/", $th->getFile())
                . "(" . $th->getLine() . ")";
            $buf = Response::html($buf, Response::YELLOW) . "</br>";
            $buf = str_replace("\\", "/", $buf);

            $traceBuf = "";
            $i = 0;
            foreach ($th->getTrace() as $it) {
                foreach ($it["args"] as $key => $arg) {
                    if (is_object($arg)) {
                        $it["args"][$key] = get_class($arg);
                    } elseif (is_string($arg)) {
                        $it["args"][$key] = "\"$arg\"";
                    }
                }
                if (!isset($it["file"])) {
                    $traceBuf .= Response::html("#{$i} [internal function]:", Response::RED);
                    $i++;
                } else {
                    $it["file"] = str_replace("\\", "/", $it["file"]);
                    $traceBuf .= Response::html("#{$i} {$it["file"]}({$it["line"]}):", Response::RED);
                    $i++;
                }
                $traceBuf .= Response::html(" {$it["class"]}{$it["type"]}{$it["function"]}(" . implode(", ", $it["args"]) . ")" , Response::ORANGE) . "<br/>";
            }
            $traceBuf .= Response::html("#{$i} {main}", Response::RED);

            $buf .= $traceBuf;
            array_push($this->response->data["debug"], $buf);
        }
        return $this;
    }
}