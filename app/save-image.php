<?php

function get_extension($file){
	$explodedFile = explode('.',$file);
	return $explodedFile[count($explodedFile) -1 ];
}

if(isset($_FILES['Filedata'])){
	$filename = md5( time().'namorados_boulevard'.$_FILES['Filedata']['name']).'.'.get_extension($_FILES['Filedata']['name']);
	$filePath = 'promoimages/'.$filename;

	if( move_uploaded_file($_FILES['Filedata']['tmp_name'], $filePath ) )
		echo 'true';
	else echo 'false';
}
