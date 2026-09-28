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

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_FILES['image'])) {
    $status = '';

    try {
        require '../connect.php';
        $status = 'success';
    } catch (PDOException $e) {
        $response['err'] = "Ошибка подключения к базе данных";
        $status = 'error';
    }

    if ($status === 'success') {
        $user_id = $_SESSION['user_id'];
        
        $img_name = $_FILES['image']['name'];
        $img_size = $_FILES["image"]["size"];
        $img_tmp = $_FILES["image"]["tmp_name"];
        
        $target_dir = "uploads/user-$user_id";
        if (!is_dir($target_dir)) {
            mkdir("uploads/user-$user_id", 0755, true);
        }
        $imageFileType = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
        $target_file = uniqid('img_', true) . '.' . $imageFileType;

        if (!exif_imagetype($img_tmp)){
            $response['err'] = "Файл не является изображением.";
        }

        else if ($img_size > 5000000) {
            $response['err'] = "Извините, ваше изображение слишком большое.";
        }

        else if ($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "webp" && $imageFileType != "gif") {
            $response['err'] = "Извините, разрешены только файлы JPG, PNG, WEBP и GIF";
        }

        else {
            if (move_uploaded_file($img_tmp, $target_dir . '/' . $target_file)) {
                try {
                    $album_id = $_POST['id'];
                    $result = $pdo->prepare("
                        SELECT id FROM albums
                        WHERE id = :album_id
                        AND user_id = :user_id
                    ");
                    $result->execute([
                        'album_id' => $album_id,
                        'user_id' => $user_id
                    ]);
                    if (!$result->fetch()) {
                        $response['err'] = "Ошибка при загрузке изображения";
                        unlink($target_dir . '/' . $target_file);
                    } else {
                        $sql = "INSERT INTO images(album_id, img_path, origin_name, file_name, size, mime_type) 
                                VALUES (:album_id, :img_path, :origin_name, :file_name, :size, :mime_type)";
                        $result = $pdo->prepare($sql);
                        $result->execute([
                            'album_id' => $album_id,
                            'img_path' => $target_dir,
                            'origin_name' => $img_name,
                            'file_name' => $target_file,
                            'size' => $img_size,
                            'mime_type' => $imageFileType
                        ]);
                        $sql = "SELECT id, created_at FROM images WHERE album_id = :album_id ORDER BY id DESC LIMIT 1";
                        $result = $pdo->prepare($sql);
                        $result->execute(['album_id' => $album_id]);
                        $img = $result->fetch();
                        $response['answer'] = [
                            $img['id'], 
                            $target_dir . '/' . $target_file,
                            $img_name,
                            $img_size,
                            $imageFileType,
                            $img['created_at']
                        ];
                    }
                } catch (PDOException $e) {
                    $response['err'] = "Ошибка при загрузке изображения";
                    unlink($target_dir . '/' . $target_file);
                }
            } else {
                $response['err'] = "Ошибка при перемещении изображения на сервер.";
            }
        }
    }
}
echo json_encode($response);
exit;