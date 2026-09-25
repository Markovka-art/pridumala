#target illustrator

(function () {
    if (app.documents.length === 0) {
        alert("Сначала откройте документ Illustrator.");
        return;
    }

    var userProfile = $.getenv("USERPROFILE");
    var downloadsFolder = userProfile ? new Folder(userProfile + "/Downloads") : null;

    if (!downloadsFolder || !downloadsFolder.exists) {
        downloadsFolder = new Folder(Folder.myDocuments.parent.fsName + "/Downloads");
    }

    if (!downloadsFolder.exists) {
        alert("Не найдена папка «Загрузки». Ожидаемый путь: " + downloadsFolder.fsName);
        return;
    }

    var pngFiles = downloadsFolder.getFiles(function (entry) {
        return entry instanceof File && /\.png$/i.test(entry.name);
    });

    if (pngFiles.length === 0) {
        alert("В папке «Загрузки» не найдено ни одного PNG-файла.");
        return;
    }

    pngFiles.sort(function (a, b) {
        return b.modified.getTime() - a.modified.getTime();
    });

    var newestPng = pngFiles[0];
    var doc = app.activeDocument;
    var artboardIndex = doc.artboards.getActiveArtboardIndex();
    var artboardRect = doc.artboards[artboardIndex].artboardRect;
    var artboardLeft = artboardRect[0];
    var artboardTop = artboardRect[1];
    var artboardWidth = artboardRect[2] - artboardRect[0];
    var artboardHeight = artboardRect[1] - artboardRect[3];

    try {
        var placed = doc.placedItems.add();
        placed.file = newestPng;
        placed.position = [
            artboardLeft + (artboardWidth - placed.width) / 2,
            artboardTop - (artboardHeight - placed.height) / 2
        ];

        doc.selection = null;
        placed.selected = true;
        placed.embed();
        app.redraw();
    } catch (error) {
        alert("Не удалось поместить PNG:\n" + newestPng.fsName + "\n\n" + error.message);
    }
}());
