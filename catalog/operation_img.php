<?php

session_start();
header('Content-Type: application/json; charset=utf-8');
$response = [];

if (!isset($_SESSION['user_id'])) {
    $response['redirect_url'] = "../main_page/main_page.html";
    echo json_encode($response);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $user_id = $_SESSION['user_id'];
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    $status = '';
    try {
        require '../connect.php';
        $status = 'success';
    } catch (PDOException $e) {
        $response['err'] = "Ошибка подключения к базе данных";
        $status = 'error';
    }
    if ($status === 'success') {

        try {
            if ($data['operation'] === 'relocate') {
                $sql = "UPDATE images SET album_id = :album_id WHERE id = :id;";
                $result = $pdo->prepare($sql);
                $result->execute(['album_id' => $data['id_album'], 'id' => $data['id_img']]);
            } 
        } catch (PDOException $e) {
            $response['err'] = "Ошибка: перемещение изображения";
        }
        try { 
            if ($data['operation'] === 'delete') {
                $id_img = $data['id'];

                $sql = "SELECT img_path, file_name FROM images WHERE id = :id_img";
                $result = $pdo->prepare($sql);
                $result->execute(['id_img' => $id_img]);
                $img = $result->fetch();

                $path_img = $img["img_path"]  . '/' . $img["file_name"];

                $sql = "DELETE FROM images WHERE id = :id_img;";
                $result = $pdo->prepare($sql);
                $result->execute(['id_img' => $id_img]);
                unlink($path_img);
            }
        } catch (PDOException $e) {
            $response['err'] = "Ошибка: удаление изображения";
        }
    }
}

echo json_encode($response);
exit;