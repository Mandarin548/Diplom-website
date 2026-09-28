<?php

session_start();
header('Content-Type: application/json; charset=utf-8');
$response = [];
setlocale(LC_ALL, 'ru_RU.UTF-8');

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
            $id_album = $data['id'];
            $sql = "SELECT id, album_id, img_path, origin_name, file_name, size, mime_type, created_at FROM images WHERE album_id = $id_album";
            $result = $pdo->query($sql);
            $imgs = $result->fetchAll();

            if ($imgs) {
                foreach ($imgs as $img) {
                    $response[$img['id']] = [
                        $img['album_id'],
                        $img['img_path'] . '/' . $img['file_name'],
                        $img['origin_name'],
                        $img['size'],
                        $img['mime_type'],
                        $img['created_at'],
                    ];
                }
            }
        } catch (PDOException $e) {
            $response['err'] = "Ошибка при загрузке изображений";
        }
    }
}
echo json_encode($response);
exit;