<?php
namespace neutron\router;

class Response {
    /** @var int */
    public $status = 200;
    /** @var array */
    public $header = [];
    public $data = "";

    // Used to print something
    /** @var bool */
    public $htmlOn = false;

    public const RED = "#F44336";
    public const PINK = "#E91E63";
    public const PURPLE = "#9C27B0";
    public const DEEP_PURPLE = "#673AB7";
    public const INDIGO = "#3F51B5";
    public const BLUE = "#2196F3";
    public const LIGHT_BLUE = "#03A9F4";
    public const TEAL = "#009688";
    public const GREEN = "#4CAF50";
    public const LIGHT_GREEN = "#8BC34A";
    public const LIME = "#CDDC39";
    public const YELLOW = "#FFEB3B";
    public const AMBER = "#FFC107";
    public const ORANGE = "#FF9800";
    public const DEEP_ORANGE = "#FF5722";
    public const BROWN = "#795548";
    public const GREY = "#9E9E9E";
    public const BLUE_GREY = "#607D8B";

    public static function html(string $data, string $color = null): string {
        $data = str_replace("\n", "<br/>", $data);
        $data = str_replace(" ", "&nbsp;", $data);
        $data = str_replace("\t", "&nbsp;&nbsp;&nbsp;&nbsp;", $data);
        return $color === null ? "<span>{$data}</span>" : "<span style=\"color:{$color}\">{$data}</span>";
    }

    public static function info($var): string {
        return var_export($var, true);
    }

    public function print(string $data, string $color = null): Response {
        return $this->append($data . "\n", $color);
    }

    public function append(string $data, string $color = null): Response {
        $data = str_replace("\r\n", "\n", $data);
        if ($this->htmlOn) {
            $this->data .= $this->html($data, $color);
        } else {
            $this->data .= $data;
        }
        return $this;
    }

    public function dump($var, string $color = null): Response {
        $this->print($this->info($var), $color);
        return $this;
    }
}