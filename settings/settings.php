<?php

session_start();
header('Content-Type: application/json; charset=utf-8');

$response = [];

if (!isset($_SESSION['user_id'])) {
    $response['error'] = 'no_session';
    echo json_encode($response);
    exit;
    
} else if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $user_id = $_SESSION['user_id'];
    $status = '';
    
    try {
        require '../connect.php';
        $status = 'success';
    } catch (PDOException $e) {
        $response['error'] = "Ошибка подключения к базе данных";
        $status = 'error';
    }
    if ($status === 'success') {

        if (isset($_POST['btn_email'])) {
            try {
                $email = trim($_POST['email']);
                if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    $response['warning'] = "Некорректный формат email";
                } else {
                    $result = $pdo->prepare("UPDATE users SET email = ? WHERE id = ?");
                    $result->execute([$email, $user_id]);
                    $response['success'] = 'Успешно: изменение email';
                }
            } catch (PDOException $e) {
                $response['error'] = "Ошибка: изменение e-mail";
            }
            
        } else if (isset($_POST['btn_password'])) {
            try {
                $pass = trim($_POST['password']);
                if (strlen($pass) < 6) {
                    $response['warning'] = "Длина пароля должна быть больше 6 символов";
                } else {
                    $pass_hash = password_hash($_POST["password"], PASSWORD_DEFAULT);
                    $result = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
                    $result->execute([$pass_hash, $user_id]);
                    $response['success'] = 'Успешно: изменение пароля';
                }
            } catch (PDOException $e) {
                $response['error'] = "Ошибка: изменение пароля";
            }

        } else if (isset($_POST['btn_username'])) {
            try {
                $username = trim($_POST['username']);
                if (empty($username)) {
                    $response['warning'] = "Введите не пустое значение";
                } else {
                    $result = $pdo->prepare("UPDATE users SET username = ? WHERE id = ?");
                    $result->execute([$username, $user_id]);
                    $response['success'] = 'Успешно: изменение имени';
                }
            } catch (PDOException $e) {
                $response['error'] = "Ошибка: изменение имени";
            }
            
        } else if (isset($_POST['btn_delete'])) {
            try {
                $result = $pdo->prepare("DELETE FROM users WHERE id = ?");
                $result->execute([$user_id]);
                session_destroy();
                $response['error'] = "no_session";

            } catch (PDOException $e) {
                $response['error'] = "Ошибка: удаление аккаунта";
            }

        } else if (isset($_POST['btn_exit'])){
            session_destroy();
            $response['error'] = "no_session";

        } else if (isset($_POST['btn_display'])) {
            try {
                $result = $pdo->prepare("UPDATE notification SET display = ? WHERE user_id = ?");
                $result->execute([$_POST['display'], $user_id]);
                $response['success'] = "Успешно: изменение отображения уведомлений";

            } catch (PDOException $e) {
                $response['error'] = "Ошибка: изменение отображения уведомлений";
            }
        } else if (isset($_POST['btn_sound'])) {
            try {
                $result = $pdo->prepare("UPDATE notification SET sound = ? WHERE user_id = ?");
                $result->execute([$_POST['sound'], $user_id]);
                $response['success'] = "Успешно: изменение звука уведомлений";

            } catch (PDOException $e) {
                $response['error'] = "Ошибка: изменение звука уведомлений";
            }
        } else if (isset($_POST['btn_volume'])) {
            try {
                $result = $pdo->prepare("UPDATE notification SET volume = ? WHERE user_id = ?");
                $result->execute([$_POST['volume'], $user_id]);
                $response['success'] = "Успешно: изменение громкости уведомлений";

            } catch (PDOException $e) {
                $response['error'] = "Ошибка: изменение громкости уведомлений";
            }
        } else if (isset($_POST['load_page'])) {
            $result = $pdo->prepare("SELECT display, sound, volume FROM notification WHERE user_id = ?");
            $result->execute([$user_id]);
            $notification = $result->fetch();
            $response['display'] = $notification['display'];
            $response['sound'] = $notification['sound'];
            $response['volume'] = $notification['volume'];

            $result = $pdo->prepare("SELECT username FROM users WHERE id = ?");
            $result->execute([$user_id]);
            $username = $result->fetch();
            $response['username'] = $username['username'];
        }
    }
    echo json_encode($response);
}