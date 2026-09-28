<?php

session_start();
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $err = "";
    $response = [];

    function test_input($data) {
        $data = trim($data);
        $data = stripslashes($data);
        $data = htmlspecialchars($data);
        return $data;
    }

    if (empty($_POST["name"]) && isset($_POST["name"])) {
        $err = "Имя обязательно\n";
    }

    if (empty($_POST["email"])) {
        $err .= "Email обязателен\n";
    } else {
        $email = test_input($_POST["email"]);
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $err .= "Некорректный формат email\n";
        }
    }

    if (empty($_POST["password"])) {
        $err .= "Password обязателен\n";
    } else if (strlen($_POST["password"]) < 6) {
        $err .= "Password должен быть не меньше 6 символов\n";
    }
    
    if (empty($err)) {
        require '../connect.php';

        $sql = "SELECT id, email, password_hash FROM users WHERE email = :email";
        $result = $pdo->prepare($sql);
        $result->execute(['email' => $_POST["email"]]);
        $user = $result->fetch(PDO::FETCH_ASSOC);

        if (isset($_POST["name"])) {
            if (!$result->rowCount()) {
                    $pass_hash = password_hash($_POST["password"], PASSWORD_DEFAULT);
                    $sql = "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)";
                    $result = $pdo->prepare($sql);
                    $result->execute([$_POST["name"], $_POST["email"], $pass_hash]);

                    $sql = "SELECT id FROM users WHERE email = :email";
                    $result = $pdo->prepare($sql);
                    $result->execute(['email' => $_POST["email"]]);
                    $user = $result->fetch(PDO::FETCH_ASSOC);

                    $_SESSION['user_id'] = $user['id'];
                    $response['redirect_url'] = "../catalog/catalog.html";

                    $sql = "INSERT INTO notification (user_id, display, sound, volume) VALUES (?, ?, ?, ?)";
                    $result = $pdo->prepare($sql);
                    $result->execute([$user['id'], 'all', 'all', 1]);
            } else {
                $response['answer'] = "Такой пользователь уже зарегистрирован!";
            }
        } else {
            if ($user) {
                if (password_verify($_POST["password"], $user["password_hash"])) {
                    $_SESSION['user_id'] = $user['id'];
                    $response['redirect_url'] = "../catalog/catalog.html";
                } else {
                    $response['answer'] = "Неверный пароль!";
                }
            } else {
                $response['answer'] = "Такого пользователя нет в системе!";
            }
        }

    } else {
        $response = ['answer' => $err];
    }
    echo json_encode($response);
    exit;
}