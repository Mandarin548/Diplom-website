<?php

$driver = 'mysql';
$host = 'localhost';
$db_name = 'website';
$db_user = 'root';
$db_pass = '';
$charset = 'utf8';
$options = [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION];

$pdo = new PDO("$driver:host=$host;dbname=$db_name;charset=$charset", $db_user, $db_pass, $options);