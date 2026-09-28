'use strict';

function showToast(message, type) {
    let toast = document.getElementById("toast");
    let sound_notification = null;
    let show = false;
    let playSound = false;

    const displayMode = toast.dataset.display
    const soundMode = toast.dataset.sound
    const volumeMode = toast.dataset.volume

    if (type === 'success') {
        show = ['all', 'success'].includes(displayMode)
        playSound = ['all', 'success'].includes(soundMode)

        if (show) {
            toast.style.backgroundColor = '#3cfa39be'
        }

        if (playSound) {
            sound_notification = new Audio('../sounds/success.mp3');
        }
    } else if (type === 'error') {
        show = ['all', 'system'].includes(displayMode)
        playSound = ['all', 'system'].includes(soundMode)

        if (show) {
            toast.style.backgroundColor = '#f52222be'
        }

        if (playSound) {
            sound_notification = new Audio('../sounds/error.mp3');
        }
    } else if (type === 'warning'){
        show = ['all', 'system'].includes(displayMode)
        playSound = ['all', 'system'].includes(soundMode)

        if (show) {
            toast.style.backgroundColor = '#ff841fbe'
        }

        if (playSound) {
            sound_notification = new Audio('../sounds/warning.mp3');
        }
    }

    if (sound_notification) {
        sound_notification.volume = +volumeMode;
        sound_notification.play().catch(() => {});
    }

    if (show) {
        toast.textContent = message
        toast.className = "toast show";

        setTimeout(function(){toast.className = toast.className.replace("show", "")}, 3000);
    }
}

let account = document.querySelector(".txt_account")
let notification = document.querySelector(".txt_notification")

notification.addEventListener('click', function(e) {
    notification.style.color = 'white';
    account.style.color = 'black';
    document.querySelector('.heading').textContent = 'Уведомления';
    document.querySelector('.notification').style.display = 'block';
    document.querySelector('.account').style.display = 'none';
});

account.addEventListener('click', function(e) {
    notification.style.color = 'black';
    account.style.color = 'white';
    document.querySelector('.heading').textContent = 'Аккаунт';
    document.querySelector('.account').style.display = 'block';
    document.querySelector('.notification').style.display = 'none';
});

document.querySelector("#rangeInput").addEventListener('input', function(e) {
    e.target.nextElementSibling.textContent = Math.trunc(+e.target.value * 100) + ' %';
    const sound = new Audio('../sounds/warning.mp3');
    sound.volume = e.target.value
    setTimeout(() => {
        sound.play()
    }, 1000);
});

document.addEventListener('DOMContentLoaded', function(e) {
    const formData = new FormData()
    formData.append('load_page', 1)
    fetch('settings.php', {
        dataType: 'json',
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data['error'] === 'no_session') {
            window.location.href = '../main_page/main_page.html';
        } else if (data['error']){
            showToast(data['error'], 'error')
        } else {
            document.querySelector('.user').children[1].textContent = data['username']
            document.querySelector(`#display`).value = data['display']
            document.querySelector(`#sound`).value = data['sound']
            document.querySelector(`#rangeInput`).value = data['volume']
            document.querySelector('#rangeValue').textContent = Math.trunc(+data['volume'] * 100) + ' %'

            const notification = document.querySelector('#toast')
            notification.dataset.display = data['display'];
            notification.dataset.sound = data['sound'];
            notification.dataset.volume = data['volume'];
        }
    })
})

document.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    let operation = e.submitter.name
    const formData = new FormData(document.querySelector('form'))
    formData.append(operation, '1')

    const agree = confirm("Нажмите ОК, чтобы подтвердить действие")
    if (!agree) {
        return
    }

    fetch('settings.php', {
        dataType: 'json',
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data['error'] === 'no_session') {
            window.location.href = '../main_page/main_page.html';
        } else if (data['error']){
            showToast(data['error'], 'error')
        } else if (data['success']){
            const notification = document.querySelector('#toast')
            if (e.submitter.name === 'btn_display') {
                notification.dataset.display = document.querySelector(`#display`).value;
            } else if (e.submitter.name === 'btn_sound') {
                notification.dataset.sound = document.querySelector(`#sound`).value;
            } else if (e.submitter.name === 'btn_volume') {
                notification.dataset.volume = document.querySelector(`#rangeInput`).value;
            }
            showToast(data['success'], 'success')
        } else if (data['warning']){
            showToast(data['warning'], 'warning')
        }
    })
    .catch(error => 
        showToast(error, 'error')
    );
});