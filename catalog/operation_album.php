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
            if ($data['operation'] === 'rename') {
                $id_album = $data['id'];
                $sql = "UPDATE albums SET title = :title WHERE id = $id_album;";
                $result = $pdo->prepare($sql);
                $result->execute(['title' => $data['title']]);
            } 
        } catch (PDOException $e) {
            $response['err'] = "Ошибка: переименование альбома";
        }

        try { 
            if ($data['operation'] === 'create'){
                $sql = "INSERT INTO albums(user_id, title) VALUES ($user_id, :title)";
                $result = $pdo->prepare($sql);
                $result->execute(['title' => $data['title']]);

                $sql = "SELECT id FROM albums WHERE user_id = $user_id ORDER BY id DESC LIMIT 1";
                $result = $pdo->query($sql);
                $album = $result->fetch();
                $response['key'] = $album['id'];
            }
        } catch (PDOException $e) {
            $response['err'] = "Ошибка: создание альбома";
        }
        try {
            if ($data['operation'] === 'delete') {
                $id_album = $data['id'];
                $sql = "SELECT file_name FROM images WHERE album_id = $id_album";
                $result = $pdo->query($sql);
                $img_paths = $result->fetchAll(PDO::FETCH_ASSOC);
                foreach($img_paths as $img_path) {
                    if (is_file("uploads/user-$user_id" . '/' . $img_path['file_name']))
                        unlink("uploads/user-$user_id" . '/' . $img_path['file_name']);
                }

                $sql = "DELETE FROM albums WHERE id = $id_album;";
                $result = $pdo->query($sql);
            }
        } catch (PDOException $e) {
            $response['err'] = "Ошибка: удаление альбома";
        }
    }
}

echo json_encode($response);
exit;