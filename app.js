+function($) {
    'use strict';

    const dropZone      = document.getElementById('drop-zone');
    const uploadForm    = document.getElementById('js-upload-form');
    const fileContainer = document.getElementById('file-container');

    const converterApiEndpoint = 'https://log-converter-s.hopetv.ru';
    // const converterApiEndpoint = 'http://localhost:3000';
    const converterApiVersion = 2;

    const processFiles = function(files) {
        for (const file of files) {
            if (typeof file != 'object') {
                continue;
            }

            const reader = new FileReader();
            reader.onload = (function(theFile) {
                return function(e) {
                    const elFile = $('<a href="#" class="list-group-item list-group-item-warning"><span class="badge alert-warning pull-right">Обработка</span>'+theFile.name+'</a>');
                    elFile.prependTo(fileContainer);

                    const logData = e.target.result;

                    if (!logData.length) {
                        const errorMessage = 'Неправильный формат файла';

                        elFile
                            .removeClass('list-group-item-warning')
                            .addClass('list-group-item-danger');
                        elFile.children('span')
                            .removeClass('alert-warning')
                            .addClass('alert-danger')
                            .text(errorMessage);

                        return;
                    }

                    const url = `${converterApiEndpoint}/v${converterApiVersion}/files`;
                    fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/octet-stream',
                            'X-Hope-FileName': theFile.name
                        },
                        body: logData
                    }).then((response) => {
                        if (response.status !== 201) {
                            throw new Error('Ответ сервера ' . response.status);
                        }

                        const xlsxLocation = converterApiEndpoint + response.headers.get('Location');

                        elFile
                            .removeClass('list-group-item-warning')
                            .addClass('list-group-item-success')
                            .attr('href', xlsxLocation);
                        elFile.children('span')
                            .removeClass('alert-warning')
                            .addClass('alert-success')
                            .text('Скачать xlsx');

                    }).catch((error) => {
                        const errorMessage = error.message;

                        elFile
                            .removeClass('list-group-item-warning')
                            .addClass('list-group-item-danger');
                        elFile.children('span')
                            .removeClass('alert-warning')
                            .addClass('alert-danger')
                            .text(errorMessage);
                    });
                };
            })(file);
            reader.readAsText(file);
        }
    };

    uploadForm.addEventListener('submit', function(e) {
        const uploadFiles = document.getElementById('js-upload-files').files;
        e.preventDefault();

        processFiles(uploadFiles);
    });

    dropZone.ondrop = function(e) {
        e.preventDefault();
        this.className = 'upload-drop-zone';

        processFiles(e.dataTransfer.files);
    };

    dropZone.ondragover = function() {
        this.className = 'upload-drop-zone drop';
        return false;
    };

    dropZone.ondragleave = function() {
        this.className = 'upload-drop-zone';
        return false;
    }

}(jQuery);
