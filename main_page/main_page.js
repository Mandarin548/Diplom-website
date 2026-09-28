'use strict';

function change_login() {
    document.getElementsByClassName('make_acc')[0].textContent = 'Вход в аккаунт';
    let container = document.getElementsByTagName('form')[0];
    container.children[0].style.display = 'none'
    let input_name = container.children[1]
    input_name.hidden = true;
    input_name.disabled = true;

    document.getElementsByClassName('btn_make')[0].textContent = 'Войти в аккаунт';
    container = document.getElementsByClassName('login')[0]
    container.children[0].textContent = 'Нет аккаунта?'
    container.children[1].textContent = 'Создать'
    container.children[1].setAttribute('onclick', 'change_signup()');
}

function change_signup() {
    let container = document.getElementsByClassName('form');
    document.getElementsByClassName('make_acc')[0].textContent = 'Создание аккаунта';
    container = document.getElementsByTagName('form')[0];
    container.children[0].style.display = 'block'
    let input_name = container.children[1]
    input_name.hidden = false;
    input_name.disabled = false;

    document.getElementsByClassName('btn_make')[0].textContent = 'Создать аккаунт';
    container = document.getElementsByClassName('login')[0]
    container.children[0].textContent = 'Есть аккаунт?'
    container.children[1].textContent = 'Войти'
    container.children[1].setAttribute('onclick', 'change_login()');
}

const EMAIL_REGEXP = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

document.getElementById('name').addEventListener('input', (e) => {
    document.getElementsByTagName('form')[0].children[10].style.display = 'none'
    let input = e.target
    if (input.value === '') {
        input.nextElementSibling.style.display = 'block'
    } else {
        input.nextElementSibling.style.display = 'none'
    }
});


document.getElementById('email').addEventListener('input', (e) => {
    document.getElementsByTagName('form')[0].children[10].style.display = 'none'
    let input = e.target
    
    if (EMAIL_REGEXP.test(input.value)) {
        input.style.border = '';
        input.nextElementSibling.style.display = 'none'
    } else {
        input.nextElementSibling.style.display = 'block'
    }
});

document.getElementById('password').addEventListener('input', (e) => {
    document.getElementsByTagName('form')[0].children[10].style.display = 'none'
    let input = e.target
    if (input.value.length < 6) {
        input.nextElementSibling.style.display = 'block'
    } else {
        input.nextElementSibling.style.display = 'none'
    }
});

document.getElementsByTagName('form')[0].addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const isLogin = document.querySelector('.make_acc').textContent === 'Вход в аккаунт';

    if (!EMAIL_REGEXP.test(email) || (password.length < 6) || (!isLogin && name.trim() === '')) {
        e.target.children[10].style.display = 'block'
        return
    }
    fetch('form.php', {
        dataType: 'json',
        method: 'POST',
        body: new FormData(document.querySelector('form'))
    })
    .then(response => response.json())
    .then(data => {
        if (data.answer) {
            alert(data.answer)
        } else {
            window.location.href = data.redirect_url;
        }
    })
    .catch(error => console.log('Ошибка:', error));
});