<?php
$dir = "images/";
$images = array();
$d = dir($dir);
while($name = $d->read()){
    if(!preg_match('/\.(jpg|gif|png)$/', $name)) continue;
    $size = filesize($dir.$name);
    $lastmod = filemtime($dir.$name)*1000;
    $images[] = array('name'=>$name, 'size'=>$size,
			'lastmod'=>$lastmod, 'url'=>'extjs-4.0.0-src/examples/view/'.$dir.$name);
}
$d->close();
$o = array('images'=>$images);
echo json_encode($o);
