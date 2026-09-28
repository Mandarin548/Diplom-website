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

function create_album() {
    if (document.getElementsByClassName('input_album').length == 0) {
        let container = document.getElementsByClassName('all_album');
        container[0].innerHTML += 
            `<div oncontextmenu="return false;" class="name_album drop_click">
                <img src="../IMG/icon-folder.png">
                <input type="text" onblur="save_create_album(this, 'Новая папка')" class="input_album">
            </div>`
    }

    document.getElementsByClassName('input_album')[0].focus();
}

document.addEventListener('contextmenu', function(e) {
    let list_elem = document.getElementsByClassName('right_click_menu')
    Array.from(list_elem).forEach((item, index) => {
        item.style.display = 'none';
        item.parentElement.style.border = 'none';
    });
    list_elem = document.getElementsByClassName('img')
    Array.from(list_elem).forEach((item, index) => {
        item.children[0].style.border = 'none';
    });

    document.getElementsByClassName('submenu2')[0].innerHTML = ''

    let element = e.target.parentElement
    if (element.classList.contains('name_album') && element != undefined) {
        e.preventDefault();
        element = element.getElementsByClassName('right_click_menu')[0]
        element.style.display = 'block'
        element.style.top = `${e.clientY}px`;
        element.style.left = `${e.clientX}px`;
        element.parentElement.style.borderRadius = '15px';
        element.parentElement.style.border = 'thin solid grey';

    } else if (element.classList.contains('img')) {
        let all_album = document.getElementsByClassName('name_album')
        let count_album = document.getElementsByClassName('all_album')[0].children.length
        let sub = document.getElementsByClassName('submenu2')[0]

        Array.from(all_album).forEach((item, index) => {
            sub.insertAdjacentHTML('beforeend',
                `<li>
                    <a href="#">
                        <p id="${item.id + '.' + element.id}" class="relocate_img">${item.children[1].textContent}</p>
                    </a>
                </li>
                ${index + 1 != count_album ? '<hr>' : ''}`
            );
        });

        globalThis.element_img = element
        e.preventDefault();
        element.children[0].style.border = '3px solid black';
        element = document.getElementsByClassName('img_grid')[0].children[0]
        element.style.display = 'block'
        element.style.top = `${e.clientY}px`;
        element.style.left = `${e.clientX}px`;
    }
});

document.addEventListener('click', function(e) {
    let list_elem = document.getElementsByClassName('right_click_menu')
    Array.from(list_elem).forEach((item, index) => {
        item.style.display = 'none'
        item.parentElement.style.border = 'none';
    });
    list_elem = document.getElementsByClassName('img')
    Array.from(list_elem).forEach((item, index) => {
        item.children[0].style.border = 'none';
    });
    document.getElementsByClassName('submenu2')[0].innerHTML = ''

    let modal = document.getElementsByClassName('modal')[0]
    globalThis.last_img = Array.from(document.getElementsByClassName('img_grid')[0].children).at(-1)
    globalThis.first_img = document.getElementsByClassName('img_grid')[0].children[1]
    if (e.target.classList.contains('clickable-image')) {
        globalThis.modal_img = e.target.parentElement
        if (modal.children.length != 3) {
            if (modal_img == first_img) {
                document.getElementsByClassName('left_arrow')[0].style.display = 'none'
            } else {
                document.getElementsByClassName('left_arrow')[0].style.display = 'flex'
            }
            if (modal_img == last_img) {
                document.getElementsByClassName('right_arrow')[0].style.display = 'none'
            } else {
                document.getElementsByClassName('right_arrow')[0].style.display = 'flex'
            }
            modal.children[0].insertAdjacentHTML('afterend', `<div>${modal_img.innerHTML}</div>`);
            modal.children[1].children[0].classList.remove('clickable-image')
            modal.children[1].children[0].classList.add('modal_img')
            modal.style.display = 'flex'
        }
    } else if (!e.target.classList.contains('modal_img') &&
        modal.children.length === 3 && 
        !e.target.parentElement.classList.contains('right_arrow') &&
        !e.target.parentElement.classList.contains('left_arrow')
        ){
        modal.style.display = 'none'
        modal.children[1].remove()
    } else if (e.target.parentElement.classList.contains('name_album')) {
        let active_album = e.target.parentElement
        let id_album = active_album.id
        if (!active_album.classList.contains('active') && active_album.querySelector('input') === null) {
            if (document.querySelector('.active')) {
                document.querySelector('.active').classList.remove('active')
            }
            let one_elem = document.querySelector('.img_grid')
            while (one_elem.children.length > 1) {
                one_elem.removeChild(one_elem.lastChild);
            }
            active_album.classList.add('active')
            fetch('upload_imgs.php', {
                dataType: 'json',
                method: 'POST',
                body: JSON.stringify({id: id_album})
            })
            .then(response => response.json())
            .then(data => {
                if (data.err) {
                    showToast(data.err, 'error')
                } else if (data.redirect_url) {
                    window.location.href = data.redirect_url;
                } else {
                    for (let key in data) {
                        document.querySelector('.img_grid').insertAdjacentHTML('beforeend', 
                        `<div class="img" 
                                id='${key}' 
                                data-size = '${data[key][3]}' 
                                data-type = '${data[key][4]}' 
                                data-date = '${data[key][5]}'>
                            <img src="${data[key][1]}" class="clickable-image">
                            <p>${data[key][2]}</p>
                        </div>`);
                    }
                }
                globalThis.all_imgs = document.querySelectorAll('.img')
                globalThis.all_filter_imgs = Array.from(document.querySelectorAll('.img'))
            })
            .catch(error => {
                showToast(`Ошибка подключения к серверу`, 'error')
            });
        }
    } else if (e.target.classList.contains('relocate_img')) {
        let id_album = (e.target.id).split('.')[0]
        let id_img = (e.target.id).split('.')[1]

        document.querySelectorAll('.all_album div').forEach(el => {
            if (el.id === id_album) {
                if (el.classList.contains('active')) {
                    showToast('Выберите другой альбом для перемещения', 'warning')
                } else {
                    fetch('operation_img.php', {
                        dataType: 'json',
                        method: 'POST',
                        body: JSON.stringify({operation: 'relocate', id_album: id_album, id_img: id_img})
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.err) {
                            showToast(data.err, 'error')
                        } else if (data.redirect_url) {
                            window.location.href = data.redirect_url;
                        } else {
                            document.querySelectorAll('.img_grid div').forEach(el => {
                                if (el.id === id_img) {
                                    el.remove()
                                    showToast('Успешно: Перемещение изображения', 'success')
                                }
                            });
                        }
                    })
                    .catch(error => {
                        showToast(`Ошибка подключения к серверу`, 'error')
                    });
                }
            }
        });
    }
});

document.getElementsByClassName('right_arrow')[0].addEventListener('click', function(e) {
    if (modal_img.nextElementSibling === last_img) {
        document.getElementsByClassName('right_arrow')[0].style.display = 'none'
    } else {
        document.getElementsByClassName('left_arrow')[0].style.display = 'flex'
    }
    if (modal_img != last_img) {
        let modal = document.getElementsByClassName('modal')[0]
        modal.children[1].remove()
        modal_img = modal_img.nextElementSibling
        modal.children[0].insertAdjacentHTML('afterend', `<div>${modal_img.innerHTML}</div>`);
        modal.children[1].children[0].classList.remove('clickable-image')
        modal.children[1].children[0].classList.add('modal_img')
    }
}); 

document.getElementsByClassName('left_arrow')[0].addEventListener('click', function(e) {
    if (modal_img.previousElementSibling === first_img) {
        document.getElementsByClassName('left_arrow')[0].style.display = 'none'
    } else {
        document.getElementsByClassName('right_arrow')[0].style.display = 'flex'
    }
    if (modal_img != first_img) {
        let modal = document.getElementsByClassName('modal')[0]
        modal.children[1].remove()
        modal_img = modal_img.previousElementSibling
        modal.children[0].insertAdjacentHTML('afterend', `<div>${modal_img.innerHTML}</div>`);
        modal.children[1].children[0].classList.remove('clickable-image')
        modal.children[1].children[0].classList.add('modal_img')
    }
});

function save_create_album(element) {
    let name_album = element.value != '' ? element.value : 'Новая папка'

    fetch('operation_album.php', {
        dataType: 'json',
        method: 'POST',
        body: JSON.stringify({operation : 'create', title: name_album})
    })
    .then(response => response.json())
    .then(data => {
        if (data.err) {
            showToast(data.err, 'error')
        } else if (data.redirect_url) {
            window.location.href = data.redirect_url;
        } else {
            element.parentElement.id = data.key
            element.parentElement.innerHTML = 
                `<img src="../IMG/icon-folder.png"> 
                <p>${name_album}</p>
                <ul class = "right_click_menu">
                    <li><button onclick="rename_album(this)">Переименовать</button></li>
                    <li><button class="delete" onclick="delete_element(this)">Удалить</button></li>
                </ul>`;
            showToast('Успешно: Создание альбома', 'success')
        }
    })
    .catch(error => {
        showToast(`Ошибка подключения к серверу`, 'error');
    });
}

function save_rename_album(element) {
    let id_album = element.parentElement.id
    let name_album = element.value != '' ? element.value : element.id
    if (name_album === element.id) {
        element.parentElement.innerHTML = 
            `<img src="../IMG/icon-folder.png"> 
            <p>${name_album}</p>
            <ul class = "right_click_menu">
                <li><button onclick="rename_album(this)">Переименовать</button></li>
                <li><button class="delete" onclick="delete_element(this)">Удалить</button></li>
            </ul>`;
        return;
    }
    fetch('operation_album.php', {
        dataType: 'json',
        method: 'POST',
        body: JSON.stringify({operation : 'rename', title: name_album, id: id_album})
    })
    .then(response => response.json())
    .then(data => {
            if (data.err) {
                showToast(data.err, 'error')
            } else if (data.redirect_url) {
            window.location.href = data.redirect_url;
            } else {
                element.parentElement.innerHTML = 
                    `<img src="../IMG/icon-folder.png"> 
                    <p>${name_album}</p>
                    <ul class = "right_click_menu">
                        <li><button onclick="rename_album(this)">Переименовать</button></li>
                        <li><button class="delete" onclick="delete_element(this)">Удалить</button></li>
                    </ul>`;
                showToast('Успешно: Переименование альбома', 'success')
            }
        })
    .catch(error => {
        showToast(`Ошибка подключения к серверу`, 'error')
    });
}

function rename_album(element) {
    if (document.getElementsByClassName('input_album').length == 0) {
        let old_name_album = element.parentElement.parentElement.previousElementSibling.textContent;
        element.parentElement.parentElement.parentElement.innerHTML = 
                `<img src="../IMG/icon-folder.png">
                <input id="${old_name_album}" type="text" onblur="save_rename_album(this)" class="input_album">`
    }
    document.getElementsByClassName('input_album')[0].focus();
}

function delete_element(element) {
    let elem = element.parentElement.parentElement.parentElement
    let id_album = elem.id
    if (elem.classList.contains('img_grid')) {
        let id_img = element_img.id
        fetch('operation_img.php', {
            dataType: 'json',
            method: 'POST',
            body: JSON.stringify({operation : 'delete', id: id_img})
        })
        .then(response => response.json())
        .then(data => {
            if (data.err) {
                showToast(data.err, 'error')
            } else if (data.redirect_url) {
            window.location.href = data.redirect_url;
            } else {
                element_img.remove();
                all_imgs = document.querySelectorAll('.img')
                showToast('Успешно: удаление изображения', 'success')
            }
        })
        .catch(error => {
            showToast(`Ошибка подключения к серверу`, 'error')
        });
    } else {
        let id_album = elem.id
        fetch('operation_album.php', {
            dataType: 'json',
            method: 'POST',
            body: JSON.stringify({operation : 'delete', id: id_album})
        })
        .then(response => response.json())
        .then(data => {
            if (data.err) {
                showToast(data.err, 'error')
            } else if (data.redirect_url) {
            window.location.href = data.redirect_url;
            } else {
                let one_elem = document.querySelector('.img_grid')
                while (one_elem.children.length > 1) {
                    one_elem.removeChild(one_elem.lastChild);
                }
                elem.remove();
                showToast('Успешно: удаление альбома', 'success')
            }
        })
        .catch(error => {
            showToast(`Ошибка подключения к серверу`, 'error')
        });
    }
}

document.getElementById('file-input').onchange = function () {
    document.getElementById('file-name').innerHTML = ` <input style="color:rgb(212, 10, 10);" type="submit" value="${this.files[0].name}" name="submit" id="submit">`;
}

document.querySelector('.upload_img').addEventListener('submit', (e) => {
    e.preventDefault();
    let id_album = document.querySelector('.active')
    if (!id_album) {
        showToast('Пожалуйста, выберите альбом', 'warning')
    } else {
        const fileInput = document.querySelector('#file-input');
        const formData = new FormData();
        formData.append('id', id_album.id);
        formData.append('image', fileInput.files[0]);
        fetch('upload_img.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.err) {
                showToast(data.err, 'error')
            } else if (data.redirect_url) {
            window.location.href = data.redirect_url;
            } else {
                document.querySelector('.img_grid').insertAdjacentHTML('beforeend', 
                `<div class="img" 
                        id='${data['answer'][0]}'
                        data-size = '${data['answer'][3]}' 
                        data-type = '${data['answer'][4]}' 
                        data-date = '${data['answer'][5]}'>
                    <img src="${data.answer[1]}" class="clickable-image">
                    <p>${data['answer'][2]}</p>
                </div>`);

                all_imgs = document.querySelectorAll('.img')
                showToast('Успешно: загрузка изображения', 'success')
            }
            document.getElementById('file-name').textContent = 'Загрузить изображение';   
        })
        .catch(error => {
            showToast(`Ошибка подключения к серверу`, 'error')
        });
    }
});

document.addEventListener('DOMContentLoaded', function(e) {
    fetch('upload_albums.php', {
        dataType: 'json',
        method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
        if (data.err) {
            showToast(data.err, 'error_not_sound')
        } else if (data.redirect_url) {
            window.location.href = data.redirect_url;
        } else{
            for (let key in data) {
                document.querySelector('.all_album').insertAdjacentHTML('beforeend', 
                `<div oncontextmenu="return false;" class="name_album" id='${key}'>
                    <img src="../IMG/icon-folder.png">
                    <p>${data[key]}</p>
                    <ul class = "right_click_menu">
                        <li><button onclick="rename_album(this)">Переименовать</button></li>
                        <li><button class="delete" onclick="delete_element(this)">Удалить</button></li>
                    </ul>
                </div>`);
            }
        }
    })
    .catch(error => {
        showToast(`Ошибка подключения к серверу`, 'error')
    });

    const formData = new FormData()
    formData.append('load_page', 1)
    fetch('../settings/settings.php', {
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
            const notification = document.querySelector('#toast')
            notification.dataset.display = data['display'];
            notification.dataset.sound = data['sound'];
            notification.dataset.volume = data['volume'];
        }
    })
});

function updateRange(input, text) {

    const value = Number(input.value);

    if (value <= 10) {

        text.textContent = value * 10 + ' Кб';

    } else if (value < 19) {

        text.textContent = (+String(value)[0] + +String(value)[1]) * 100 + ' Кб';

    } else if (value < 29) {

        text.textContent = (value - 18) + ' Мб';

    } else if (value < 33) {

        text.textContent = (value - 27) * 10 + ' Мб';

    }
}

document.querySelector("#rangeInput").addEventListener('input', function(e) {
    updateRange(e.target, e.target.nextElementSibling)
});
document.querySelector("#rangeInput2").addEventListener('input', function(e) {
    updateRange(e.target, e.target.nextElementSibling)
});

document.querySelector('#form_filter').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!document.querySelector('.active')) {
        showToast('Пожалуйста, выберите альбом', 'warning')
        return
    } else if (!all_imgs.length) {
        showToast('Нет изображений для фильтрации', 'warning')
        return
    }
    const formData = new FormData(e.target);
    const all_img = Array.from(all_imgs)
    const parent = document.querySelector('.img_grid')
    let error = ''
    let filtered;

    if (e.submitter.id === 'btn_size') {
        let rangeInput = e.target.elements['rangeInput'].nextElementSibling.textContent.split(" ")
        let rangeInput2 = e.target.elements['rangeInput2'].nextElementSibling.textContent.split(" ")
        
        if (rangeInput[0] !== '-') {
            rangeInput = rangeInput[1] === 'Мб' ? +rangeInput[0] * 1048576 : +rangeInput[0] * 1024
        } else {
            rangeInput = 'none'
        }
        if (rangeInput2[0] !== '-') {
            rangeInput2 = rangeInput2[1] === 'Мб' ? +rangeInput2[0] * 1048576 : rangeInput2[0] * 1024
        } else {
            rangeInput2 = 'none'
        }

        if(rangeInput2 < rangeInput || (rangeInput === 'none' && rangeInput2 === 'none')) {
            error = 'error'
        } else if (rangeInput !== 'none' && rangeInput2 === 'none') {
            filtered = all_img.filter(x => x.dataset.size >= rangeInput)
        } else if (rangeInput2 !== 'none' && rangeInput === 'none') {
            filtered = all_img.filter(x => x.dataset.size <= rangeInput2)
        } else {
            filtered = all_img.filter(x => x.dataset.size >= rangeInput && x.dataset.size <= rangeInput2)
        }
    } 
    if (e.submitter.id === 'btn_date') {
        let input_date = formData.get('date')
        let input_date2 = formData.get('date2')
        let date = new Date(formData.get('date'))
        let date2 = new Date(formData.get('date2'))
        if(date > date2 || (!input_date && !input_date2) || date > new Date()) {
            error = 'error'
        } else if (input_date && !input_date2) {
            filtered = all_img.filter(x => new Date(x.dataset.date) >= date)
        } else if (!input_date && input_date2) {
            filtered = all_img.filter(x => new Date(x.dataset.date) <= date2)
        } else {
            filtered = all_img.filter(x => new Date(x.dataset.date) >= date && new Date(x.dataset.date) <= date2)
        }
    } 
    if (e.submitter.id === 'btn_orient') {
        let check_box1 = formData.get('gorizont')
        let check_box2 = formData.get('vertical')
        let check_box3 = formData.get('square')

        function filter_orient(x) {
            let width_img = x.children[0].naturalWidth
            let height_img = x.children[0].naturalHeight

            if (check_box1 && !check_box2 && !check_box3) {
                return width_img > height_img
            } else if (!check_box1 && check_box2 && !check_box3) {
                return width_img < height_img
            } else if (!check_box1 && !check_box2 && check_box3) {
                return width_img === height_img
            } else if (check_box1 && check_box2 && !check_box3) {
                return width_img !== height_img
            } else if (check_box1 && !check_box2 && check_box3) {
                return width_img >= height_img
            } else if (!check_box1 && check_box2 && check_box3) {
                return width_img <= height_img
            } else {
                return true
            }
        }
        filtered = all_img.filter(filter_orient)
    }
    if (e.submitter.id === 'btn_type') {
        let check_input = []

        document.querySelectorAll('input[name="type"]').forEach((checkbox) => {
            if (checkbox.checked) {
                check_input.push(checkbox.id)
            }
        });
        if (!check_input.length) {
            filtered = all_img
        } else {
            filtered = all_img.filter(x => check_input.includes(x.dataset.type))
        }
    }
    if (e.submitter.id === 'btn_sort_date') {
        const selectedRadio = document.querySelector('input[name="date"]:checked');
        if (selectedRadio) {
            let num = 1
            if (selectedRadio.id === 'new')
                num = -1
            filtered = all_img.sort((a, b) => {
                const date1 = new Date(a.dataset.date);
                const date2 = new Date(b.dataset.date);
                return (date1 - date2) * num;
            });
        } else {
            error = 'error'
        }
    }
    if (e.submitter.id === 'btn_sort_size') {
        const selectedRadio = document.querySelector('input[name="size"]:checked');
        if (selectedRadio) {
            let num = 1
            if (selectedRadio.id === 'big')
                num = -1
            filtered = all_img.sort((a, b) => {
                const size1 = +a.dataset.size;
                const size2 = +b.dataset.size;
                return (size1 - size2) * num;
            });
        } else {
            error = 'error'
        }
    }
    if (e.submitter.id === 'btn_sort_alph') {
        const selectedRadio = document.querySelector('input[name="alph"]:checked');
        if (selectedRadio) {
            let num = 1
            if (selectedRadio.id === 'realph')
                num = -1
            filtered = all_img.sort((a, b) => {
                const alph1 = a.children[1].textContent;
                const alph2 = b.children[1].textContent;
                return alph1.localeCompare(alph2) * num;
            });
        } else {
            error = 'error'
        }
    }

    if (!error) {
        while (parent.children.length > 1) {
            parent.removeChild(parent.lastChild);
        }
        filtered.forEach(function(item) {
            parent.appendChild(item);
        });
    } else {
        showToast(`Некорректный фильтр`, 'warning')
        return
    }
});

document.querySelector('#filter_clear').addEventListener('click', (e) => {
    document.querySelector('#rangeValue').textContent = '- - - -'
    document.querySelector('#rangeValue2').textContent = '- - - -'
    document.querySelector('#form_filter').reset()
})
document.querySelector('#sorter_clear').addEventListener('click', (e) => {
    document.querySelector('#form_filter').reset()
})