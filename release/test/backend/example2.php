<?php
require_once __DIR__ . "/../../build/Synapse.phar";

use api\Synapse;

Synapse::match("random", function () {
    $min = (int) Synapse::data("min");
    $max = (int) Synapse::data("max");
    if ($max === $min) {
        Synapse::response([
            "code" => -1,
            "error" => "两个数相同, 输入值非法"
        ]);
    } else {
        Synapse::response([
            "code" => 0,
            "num" => rand($min, $max)
        ]);
    }
});

/*
Synapse各方法的签名
match($apiPattern, $fun) 匹配传过来的api是否和该模式匹配, 匹配则执行$fun函数,
会把匹配得到的参数同时传进函数里去

response(array $data): void 用于向浏览器返回一个数组
data(): array 获取所有传过来的数据
data(string $name, $default = null): mixed 获取传过来数据的一项 等价于 data()[$name]
file(): array 获取传过来文件
file(string $name, $default = null): mixed 获取传过来文件的一项 等价于 file()[$name]
filter(): array 获取URL传过来的数据
filter(string $name): mixed 获取URL传过来的数据的一项 等价于 filter()[$name]
*/