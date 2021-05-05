<?php
/**
 * User: mukminov
 * Date: 26.11.13
 * Time: 11:36
 * To change this template use File | Settings | File Templates.
 */
$folder = join( DIRECTORY_SEPARATOR, array( dirname(__FILE__),'data'));
$files = scandir($folder);
require_once 'Excel/reader.php';
require_once '../getconfig.php';

$configFile = getConfigFile('protected/config/main.php', 'dev.config.php');
if(is_string($configFile))
	$configFile = require($configFile);

$dbSettings = $configFile['components']['db'];

/** @var $db CDbConnection */
$db = new $dbSettings['class'];
foreach($dbSettings as $prop => $value){
	$db->$prop = $value;
}

foreach($files as $file){
	$fileInfo = pathinfo($file);
	if($file == '.' || $file == '..' || $fileInfo['extension'] != 'xls') continue;

	if( mb_ereg_match('/^на \d{2}\.\d{2}\.\d{4}$/', $fileInfo['filename'])){
		loadIncomes($db, $file);
	}
}

function loadIncomes($db, $file){
	$data = new Spreadsheet_Excel_Reader();
	$data->setOutputEncoding('utf-8');
	$data->read($file);

}