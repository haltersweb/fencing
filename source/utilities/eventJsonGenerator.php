<?php
	$url = 'https://api.askfred.net/v1/event/' . $_POST["event_number"] . '?_api_key=fc7e532a0099ca5e71ef4726640d0353';
	$generatedJsonUrl = '../data/' . $_POST["event_number"] . '.json';
	$content = file_get_contents($url);
	$json = json_decode($content, true); //needs to be an Array object for use in the below PHP
	//USE THIS PRINT TO TEST THAT DATA RECEIVED FOR JSON CALL
	print $_POST["event_number"];
	print '<br>';
	foreach($json['event']['preregs'] as $item) {
		print $item['competitor']['first_name'];
		print ' - ';
		print $item['competitor']['last_name'];
		print '<br>';
	}
	//Write json object ($content) to json file.
	$file = fopen($generatedJsonUrl,'w+');
	fwrite($file, $content);
	fclose($file);
?>