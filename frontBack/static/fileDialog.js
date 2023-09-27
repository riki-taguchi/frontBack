

class FileAddDialog {
    constructor() {

        console.log('今から2つ目のコンストラクタを処理します');

        /** モーダル */
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'fileAddDialog';
        modal.tabIndex = -1;
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', `fileAddDialog-title`);
        modal.setAttribute('aria-hidden', 'true');

        /** モーダルダイアログ */
        const modalDialog = document.createElement('div');
        modalDialog.className = 'modal-dialog modal-xl rounded';
        modalDialog.setAttribute('role', 'document');

        /** モーダルコンテンツ */
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';

        /** モーダルヘッダー */
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';

        /** モーダルタイトル */
        const modalTitle = document.createElement('h5');
        modalTitle.className = 'modal-title';
        modalTitle.innerText = 'ファイル登録';

        /** 閉じるボタン（ヘッダー） */
        const closeIconButton = document.createElement('button');
        closeIconButton.type = 'button';
        closeIconButton.className = 'btn-close';
        closeIconButton.setAttribute('data-bs-dismiss', 'modal');
        closeIconButton.setAttribute('aria-label', 'Close');

        /** モーダル本体上部 */
        const modalBody1 = document.createElement('div');
        modalBody1.className = 'modal-body';

        /** モーダル本体下部 */
        const modalBody2 = document.createElement('ul');
        modalBody2.className = 'modal-body text-nowrap list-unstyled overflow-auto';
        modalBody2.style.height = 'calc(100vh - 350px)';

        /** ファイル参照ラベル */
        const fileReferenceLabel = document.createElement('label');
        fileReferenceLabel.appendChild(document.createTextNode('参照'));
        //fileReferenceLabel.className = 'kintoneplugin-button-normal';
        fileReferenceLabel.style.cursor = 'pointer';

        /** ファイル参照 */
        const fileReference = document.createElement('input');
        fileReference.setAttribute('type', 'file');
        fileReference.setAttribute('multiple', '');
        fileReference.style.display = 'none';

        /** ファイル一覧表示 */
        fileReference.addEventListener('change', (event) => {
            while (modalBody2.firstChild) {
                modalBody2.removeChild(modalBody2.firstChild);
            }
            const files = event.target.files;
            for (var i = 0; i < files.length; i++) {
                const file = files[i];
                const fileName = file.name;
                const fileList = document.createElement('li');
                fileList.innerText = `${fileName}`;

                // リストにファイル名を追加する
                modalBody2.appendChild(fileList);
            }
        });

        /** モーダルフッター */
        const modalFooter = document.createElement('div');
        modalFooter.className = 'modal-footer';

        /** キャンセルボタン（フッター）*/
        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'btn btn-info mr-auto';
        closeButton.setAttribute('data-bs-dismiss', 'modal');
        closeButton.innerText = 'キャンセル';

        /** 登録ボタン */
        const registrationButton = document.createElement('button');
        registrationButton.className = 'btn btn-info mr-3';
        registrationButton.innerText = '登録';
        /** 登録処理中かどうか */
        let isSubmitting = false;
        registrationButton.onclick = async (event) => {
            if (fileReference.files.length > 0) {

                if (isSubmitting) {
                    // 登録処理が実行中の場合は処理をスキップ
                    return;
                }
                isSubmitting = true;

                /** 選択されたファイルのオブジェクト */
                const files = fileReference.files;

                const promises = [];
                for (var i = 0; i < files.length; i++) {
                    const file = files[i];

                    const reader = new FileReader();

                    // ファイルをバイナリデータで読み込む
                    reader.readAsArrayBuffer(file);


                    const promise = new Promise((resolve) => {
                        reader.onload = function () {
                            /** 読み込んだファイルをBlob オブジェクトに変換 */
                            const blobData = new Blob([reader.result], { type: file.type });
                            resolve({ name: file.name, data: blobData });
                            console.log('blobData : ', blobData);
                        };
                    });

                    promises.push(promise);
                }
                console.log('promises : ', promises);

                /** promises が解決されるまで待機 */
                const results = await Promise.all(promises);
                /**  */
                const resultsGetFiles = results.map(result => {
                    return {
                        name: result.name,
                        response: result.data,
                        opts: {
                            fileName: result.name
                        }
                    };
                });
                console.log('resultsGetFiles : ', resultsGetFiles);

                // 新しいXMLHttpRequestを作成
                var xhr = new XMLHttpRequest();

                // POSTメソッドで送信するURLを指定 サーバーを http://localhost:5000/upload に指定
                xhr.open('POST', 'http://localhost:5000/upload', true);

                // フォームデータを作成
                var formData = new FormData();

                console.log('resultsGetFiles[0].response : ', resultsGetFiles[0].response);
                // フォームデータにファイルデータを追加
                for (var i = 0; i < resultsGetFiles.length; i++) {
                    formData.append('file' + i, resultsGetFiles[i].response, resultsGetFiles[i].name);
                }

                // データを送信
                xhr.send(formData);


                xhr.onload = function () {
                    if (xhr.status == 200) {

                        //// Bootstrap 4 ではjQueryを使わないと書けない
                        $(modal).modal('hide');
                        window.location.reload();
                    }
                }

            }
        }
        /** モーダルの親要素 */
        const oya = document.getElementById('B');

        console.log('今から2つ目のモーダルを配置します');
        oya.appendChild(modal);
        modal.appendChild(modalDialog);

        modalDialog.appendChild(modalContent);

        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody1);
        modalContent.appendChild(modalFooter);

        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeIconButton);

        modalBody1.appendChild(fileReferenceLabel);
        fileReferenceLabel.appendChild(fileReference);
        modalBody1.appendChild(modalBody2);

        modalFooter.appendChild(closeButton);
        modalFooter.appendChild(registrationButton);


    }

    show() {

        $('#fileAddDialog').modal('show');

    }
}