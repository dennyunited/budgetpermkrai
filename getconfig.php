<?php
/**
 * User: mukminov
 * Date: 28.11.13
 * Time: 16:06
 * To change this template use File | Settings | File Templates.
 */
function getConfigFile($configFile, $newConfigFileName){
	/** Проверяем, есть ли настройки для разработки на данном компьютере. Файл dev.config.php
	 * лежит в ../.devConfigs/<Название _папки_в_которой_лежит_проект>/,
	 * <Название _папки_в_которой_лежит_проект> для данного проекта = ClearBudget
	 * dev.config.php должен вернуть те настройки, которые надо перекрыть либо добавить, например:
	 *
	<?php
	return array(
	'components' => array(
	// переопределяем компонент db
	'db' => array(
	'class' => 'application.extensions.PHPPDO.CPdoDbConnection',
	'pdoClass' => 'PHPPDO',
	'connectionString' => 'oci:dbname=NFBR_GASU;charset=UTF8',
	'username' => 'clearbudget',
	'password' => 'clearbudget',
	'schemaCachingDuration' => 3600,
	'enableProfiling' => FALSE,
	'enableParamLogging' => FALSE,
	'initSQLs' => array("ALTER SESSION SET NLS_NUMERIC_CHARACTERS = ', '", "alter session set NLS_DATE_FORMAT = 'DD.MM.YYYY'"
	),
	),
	),
	)
	?>
	 */
	$path = explode(DIRECTORY_SEPARATOR, realpath(dirname(__FILE__)));
	$appFolder = array_pop($path);
	$path[] = '.devConfigs';
	$path[] = $appFolder;
	$path[] = $newConfigFileName;
	$devConfigs = join(DIRECTORY_SEPARATOR, $path);

	if (file_exists($devConfigs)) {
		$configFile = array_replace_recursive(
		// подключаем основную конфигурацию
			require($configFile),
			// подключаем настройки для разработки
			require($devConfigs)
		);
	}
	return $configFile;
}