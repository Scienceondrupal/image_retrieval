<?php


    try {
        // open connection to MongoDB server
        $conn = new Mongo('localhost');

        // access database
        $db = $conn->sod;

        // access collection
        $collection = $db->items;

        $collection->remove();


        $file_handle = fopen('field_revision_field_imagelink.txt', "r");
        while (!feof($file_handle)) {
            $line = trim(fgets($file_handle));

            if ($line == "") {
                continue;
            }

            $line = str_replace("http://autiger.itsc.uah.edu", "ftp://ghrc.nsstc.nasa.gov", $line);

            $item = array("url" => trim($line), "type" => "node", "id" => $i, "md5" => md5(trim($line)));

            $folderList = explode("/", trim($line));
            for ($f = 0; $f < count($folderList); $f++) {
                $item['f' . $f] = $folderList[$f];
            }

            $item['lastIndex'] = $f;

            $collection->insert($item);



        }

        $conn->close();
    } catch (MongoConnectionException $e) {
        die('Error connecting to MongoDB server');
    } catch (MongoException $e) {
        die('Error: ' . $e->getMessage());
    }

?>