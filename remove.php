<?php


try {
    // open connection to MongoDB server
    $conn = new Mongo('localhost');

    // access database
    $db = $conn->sodtest;

    // access collection
    $collection = $db->items;

    $cursor = $collection->find();

    foreach ($cursor as $obj) {

        if ($obj['f5'] == "lip" || $obj['f5'] == "lis" || $obj['f5'] == "otd") {

            $collection->remove(array("_id" => $obj['id']));

        }
    }
    //$conn->close();
} catch (MongoConnectionException $e) {
    die('Error connecting to MongoDB server');
} catch (MongoException $e) {
    die('Error: ' . $e->getMessage());
}




