<?php

session_start();
header('Content-Type: application/json; charset=utf-8');
$response = [];

if (!isset($_SESSION['user_id'])) {
    $response['redirect_url'] = "../main_page/main_page.html";
    echo json_encode($response);
    exit;

} else if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $user_id = $_SESSION['user_id'];
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
            $sql = "SELECT id, title FROM albums WHERE user_id = $user_id";
            $result = $pdo->query($sql);
            $albums = $result->fetchAll();

            if ($albums) {
                foreach ($albums as $album) {
                    $response[$album['id']] = $album['title'];
                }
            }
        } catch (PDOException $e) {
            $response['err'] = "Ошибка при загрузке альбомов";
        }
    }
}

echo json_encode($response);
exit;