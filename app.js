+function($) {
    'use strict';

    var dropZone      = document.getElementById('drop-zone');
    var uploadForm    = document.getElementById('js-upload-form');
    var fileContainer = document.getElementById('file-container');

    var converterApiEndpoint = 'http://forward-converter.s.hope.ua/v1';

    var normalizeXml = function(xml) {
        if (xml.search('<?xml') == -1) {
            return false;
        }

        // Close xml tag
        if (xml.search('</root>') == -1) {
            xml += '</root>';
        }

        try {
            $.parseXML(xml);
        } catch (err) {
            return false;
        }

        return xml;
    };

    var processFiles = function(files) {
        for (var i in files) {
            if (!files.hasOwnProperty(i)) {
                continue;
            }

            var file = files[i];
            if (typeof file != 'object') {
                continue;
            }

            var reader = new FileReader();
            reader.onload = (function(theFile) {
                return function(e) {
                    var elFile = $('<a href="#" class="list-group-item list-group-item-warning"><span class="badge alert-warning pull-right">Обработка</span>'+theFile.name+'</a>');
                    elFile.prependTo(fileContainer);

                    var xmlData = e.target.result;
                    xmlData = normalizeXml(xmlData);

                    if (xmlData === false) {
                        var errorMessage = 'Неправильный формат файла';
                        elFile
                            .removeClass('list-group-item-warning')
                            .addClass('list-group-item-danger');
                        elFile.children('span')
                            .removeClass('alert-warning')
                            .addClass('alert-danger')
                            .text(errorMessage);

                        return;
                    }

                    $.ajax({
                        url: converterApiEndpoint + '/jobs',
                        method: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify({data: xmlData})
                    }).done(function(data){
                        if (data.xlsx) {
                            elFile
                                .removeClass('list-group-item-warning')
                                .addClass('list-group-item-success')
                                .attr('href', data.xlsx);
                            elFile.children('span')
                                .removeClass('alert-warning')
                                .addClass('alert-success')
                                .text('Скачать xlsx');
                        }
                    }).fail(function(response){
                        var data = response.responseJSON;
                        var errorMessage = 'Странная ошибка, проверьте файл';
                        if (data.error) {
                            errorMessage = data.error.message;
                        }
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
            reader.readAsText(files[i]);
        }
    };

    uploadForm.addEventListener('submit', function(e) {
        var uploadFiles = document.getElementById('js-upload-files').files;
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