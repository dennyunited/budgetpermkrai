<?php
//if (isset($_REQUEST['prognoz'])) { phpinfo();die; }
require_once('protected/extensions/PHPWord/PHPWord.php');
session_start();
date_default_timezone_set('Asia/Yekaterinburg');
//require_once('protected/components/system/Environment.php');
require_once('getconfig.php');


error_reporting(E_ALL);
ini_set('display_errors', 1);


$configFile = getConfigFile('protected/config/main.php', 'dev.config.php');
$isDevEnv = false;

if(is_array($configFile)){
	$isDevEnv = isset($configFile['params']['enableDebugging']) ? $configFile['params']['enableDebugging'] : false;
}

$yii = 'framework/yii' . (true || $isDevEnv ? '' : 'lite') . '.php';
defined('YII_DEBUG') or define('YII_DEBUG', $isDevEnv or false);

require_once($yii);
Yii::createWebApplication($configFile)->run();