window.onload = function () {

    const filePreviewDialog = new FilePreviewDialog();
    console.debug('ロードされた１');

    const fileAddDialog = new FileAddDialog();
    console.debug('ロードされた２');

    const fileAddButton = document.getElementById('fileAddButton');
    fileAddButton.onclick = function () {
        console.debug('ファイル追加ボタン押された');
        fileAddDialog.show();
    }

    // ファイル名がクリックされたとき、img.srcが書き変わるようにする。

    const tbody = document.getElementById('tbodySpace');

    // 新しいXMLHttpRequestを作成
    var xhr = new XMLHttpRequest();
    console.debug('xhr1 : ', xhr);
    // POSTメソッドで送信するURLを指定 サーバーを http://localhost:5000/upload に指定
    xhr.open('Get', 'http://localhost:5000/upload', true);
    console.debug('xhr2 : ', xhr);

    xhr.onload = function () {
        if (xhr.status == 200) {
            // サーバーから返された新しいファイル情報を受け取る
            var fileInfos = JSON.parse(xhr.responseText);
            console.debug('xhr.responseText : ', xhr.responseText);

            for (var i = 0; i < fileInfos.length; i++) {
                console.debug('File ID: ' + fileInfos[i].id);
                console.debug('File name: ' + fileInfos[i].name);
                console.debug('File link: ' + fileInfos[i].link);
            }

            const newFileTr = [];
            const newFileId = [];
            const newFileName = [];
            const newFileDelete = [];
            for (var i = 0; i < fileInfos.length; i++) {
                newFileTr[i] = document.createElement('tr');
                newFileId[i] = document.createElement('td');
                newFileName[i] = document.createElement('td');
                newFileDelete[i] = document.createElement('td');

                // テーブルに新しいファイルIDを表示
                newFileId[i].innerText = fileInfos[i].id;

                newFileName[i].innerText = fileInfos[i].name;
                newFileName[i].style.cursor = 'pointer';
                newFileName[i].style.color = 'blue';
                newFileName[i].onclick = (function (fileInfo) {
                    return function () {
                        filePreviewDialog.img.src = fileInfo.link;
                        filePreviewDialog.show();
                    };
                })(fileInfos[i]);

                newFileName[i].onmouseover = function () {

                    this.style.textDecoration = 'underline';
                }
                newFileName[i].onmouseleave = function () {

                    this.style.textDecoration = 'none';
                }

                newFileDelete[i].innerText = '✖';
                newFileDelete[i].style.cursor = 'pointer';

                newFileDelete[i].onclick = (function (fileInfo) {
                    return function () {
                        var xhr = new XMLHttpRequest();
                        xhr.open('DELETE', 'http://localhost:5000/upload/' + fileInfo.id, true);
                        xhr.onload = function () {
                            if (xhr.status == 200) {
                                window.location.reload();
                            } else {
                                console.error('Failed to delete file: ' + xhr.status);
                            }
                        }
                        xhr.send();
                    };
                })(fileInfos[i]);

                tbody.appendChild(newFileTr[i]);
                newFileTr[i].appendChild(newFileId[i]);
                newFileTr[i].appendChild(newFileName[i]);
                newFileTr[i].appendChild(newFileDelete[i]);
            }

        }
    }

    // リクエストをサーバーに送信
    xhr.send();



};


class FilePreviewDialog {

    imgSrc;

    img = document.createElement('img');


    constructor() {

        console.log('今から1つ目のコンストラクタを処理します');

        /** 拡大率リスト */
        const zoomRates = [10, 20, 30, 40, 50, 70, 100, 150, 200, 300];

        /** 拡大率の最小値 */
        const minZoomRate = Math.min(...zoomRates);

        /** 拡大率の最大値 */
        const maxZoomRate = Math.max(...zoomRates);

        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'filePreviewDialog';
        modal.tabIndex = -1;
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'filePreviewDialog-title');
        modal.setAttribute('aria-hidden', 'true');
        //modal.style.display = 'block';

        const modalDialog = document.createElement('div');
        modalDialog.className = 'modal-dialog modal-xl rounded';
        modalDialog.setAttribute('role', 'document');

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';

        /** モーダルヘッダー */
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';

        /** モーダルタイトル */
        const modalTitle = document.createElement('h5');
        modalTitle.className = 'modal-title';
        modalTitle.innerText = '画像プレビュー';

        /** 閉じるボタン（ヘッダー） */
        const closeIconButton = document.createElement('button');
        closeIconButton.type = 'button';
        closeIconButton.className = 'close';
        closeIconButton.setAttribute('data-dismiss', 'modal');
        closeIconButton.setAttribute('aria-label', 'Close');
        closeIconButton.innerHTML = '&times;';

        /** モーダル本体 */
        const modalBody = document.createElement('div');
        modalBody.className = 'modal-body';

        /** モーダル本体コンテンツ */
        const bodyContent = document.createElement('div');
        bodyContent.className = 'w-100';
        bodyContent.style.backgroundColor = 'lightgray';

        /** 画像表示用 div タグ */
        const imgDiv = document.createElement('div');
        imgDiv.className = 'w-100';
        imgDiv.style.height = 'calc(100vh - 200px)';
        imgDiv.style.overflow = 'scroll';

        /** 画像表示用タグ間の div タグ */
        const imgBetweenDiv = document.createElement('div');
        imgBetweenDiv.style.transitionDuration = '200ms';
        imgBetweenDiv.style.overflow = 'hidden';
        // 画像を中央に配置（親要素の display:grid とあわせると、上下の margin も自動調整できる）
        imgBetweenDiv.style.margin = 'auto';

        /** 画像の角度 */
        let imgDeg = 0;
        /**画像の大きさ */
        let zoomRate;

        /** 画像表示用イメージタグ */
        //const img = document.createElement('img');
        this.img.style.transitionDuration = '200ms';
        this.img.style.cursor = 'zoom-in';
        this.img.style.display = 'none';
        //this.img.src = '/static/pixel.png';
        this.img.alt = 'gazounosetumei';

        this.img.onclick = function () {
            /** 高さ基準の時のパーセンテージ */
            const heightBasePercentage = Math.floor((imgDiv.clientHeight / ((imgDeg % 180 === 0) ? this.img.clientHeight : this.img.clientWidth)) * 100);

            /** 幅基準の時のパーセンテージ */
            const widthBasePercentage = Math.floor((imgDiv.clientWidth / ((imgDeg % 180 === 0) ? this.img.clientWidth : this.img.clientHeight)) * 100);

            zoomRate = zoomRate != heightBasePercentage ? heightBasePercentage : widthBasePercentage;

            adjustImage();
        }.bind(this);  // bind `this` to the event handler

        /** モーダルフッター */
        let modalFooter = document.createElement('div');
        modalFooter.className = 'modal-footer';

        /** 回転ボタングループ */
        const rotateButtonGroup = document.createElement('div');
        rotateButtonGroup.className = 'btn-group ml-auto';
        rotateButtonGroup.role = 'group';

        /** 画像用左回転ボタン */
        const rotateLeftButton = document.createElement('button');
        rotateLeftButton.className = 'btn btn-info';
        rotateLeftButton.innerHTML = '<i class="fa fa-rotate-left"></i>';
        rotateLeftButton.onclick = function (event) {
            imgDeg -= 90;
            adjustImage();
        };

        /** 画像用右回転ボタン */
        const rotateRightButton = document.createElement('button');
        rotateRightButton.className = 'btn btn-info';
        rotateRightButton.innerHTML = '<i class="fa fa-rotate-right"></i>';
        rotateRightButton.onclick = function (event) {
            imgDeg += 90;
            adjustImage();
        };

        /** 拡縮ボタングループ */
        const zoomButtonGroup = document.createElement('div');
        zoomButtonGroup.className = 'btn-group';
        zoomButtonGroup.role = 'group';

        /**拡大ボタン */
        const zoomInButton = document.createElement('button');
        zoomInButton.className = 'btn btn-info';
        zoomInButton.innerHTML = '<i class="fa-solid fa-magnifying-glass-plus"></i>';
        zoomInButton.onclick = function (event) {
            zoomRate = zoomRates.find(zr => zr > zoomRate) ?? maxZoomRate;
            adjustImage();
        };

        /**縮小ボタン */
        const zoomOutButton = document.createElement('button');
        zoomOutButton.className = 'btn btn-info';
        zoomOutButton.innerHTML = '<i class="fa-solid fa-magnifying-glass-minus"></i>';
        zoomOutButton.onclick = function (event) {
            zoomRate = zoomRates.findLast(zr => zr < zoomRate) ?? minZoomRate;
            adjustImage();
        };

        /**高さ基準ボタン */
        const heightBaseButton = document.createElement('button');
        heightBaseButton.className = 'btn btn-info';
        heightBaseButton.innerHTML = '<i class="fa-solid fa-arrows-up-down"></i>';
        heightBaseButton.onclick = function (event) {
            zoomRate = Math.floor((imgDiv.clientHeight / ((imgDeg % 180 === 0) ? this.img.clientHeight : this.img.clientWidth)) * 100);
            adjustImage();
        }.bind(this);

        /**幅基準ボタン */
        const widthBaseButton = document.createElement('button');
        widthBaseButton.className = 'btn btn-info';
        widthBaseButton.innerHTML = '<i class="fa-solid fa-arrows-left-right"></i>';
        widthBaseButton.onclick = function (event) {
            zoomRate = Math.floor((imgDiv.clientWidth / ((imgDeg % 180 === 0) ? this.img.clientWidth : this.img.clientHeight)) * 100);
            adjustImage();
        }.bind(this);

        /** 拡大率表示テキストボックス */
        const zoomRateTextBox = document.createElement('input')
        zoomRateTextBox.className = 'form-control mr-auto';
        zoomRateTextBox.type = 'text';
        zoomRateTextBox.style.width = '55px';
        zoomRateTextBox.style.height = '38px';
        zoomRateTextBox.onchange = function (event) {
            zoomRate = Math.floor(zoomRateTextBox.value);
            zoomRate = Math.max(5, zoomRate);
            zoomRate = Math.min(500, zoomRate);
            adjustImage();
        }

        /** モーダルの親要素 */
        const oya = document.getElementById('A');

        console.log('今から1つ目のモーダルを配置します');
        // 各要素の配置
        oya.appendChild(modal);
        modal.appendChild(modalDialog);
        modalDialog.appendChild(modalContent);

        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modalContent.appendChild(modalFooter);

        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeIconButton);

        modalBody.appendChild(bodyContent);
        bodyContent.appendChild(imgDiv);
        imgDiv.appendChild(imgBetweenDiv);
        imgBetweenDiv.appendChild(this.img);

        modalFooter.appendChild(rotateButtonGroup);
        modalFooter.appendChild(zoomButtonGroup);
        modalFooter.appendChild(zoomRateTextBox);
        rotateButtonGroup.appendChild(rotateLeftButton);
        rotateButtonGroup.appendChild(rotateRightButton);
        zoomButtonGroup.appendChild(zoomInButton);
        zoomButtonGroup.appendChild(zoomOutButton);
        zoomButtonGroup.appendChild(heightBaseButton);
        zoomButtonGroup.appendChild(widthBaseButton);

        const adjustImage = () => {

            let offsetX = 0;
            let offsetY = 0;

            /** 実際に表示される画像の幅 */
            const imageWidth = ((imgDeg % 180 === 0) ? this.img.width : this.img.height) * zoomRate / 100;
            /** 実際に表示される画像の高さ */
            const imageHeight = ((imgDeg % 180 === 0) ? this.img.height : this.img.width) * zoomRate / 100;

            offsetX = (imageWidth - this.img.width) / 2;
            offsetY = (imageHeight - this.img.height) / 2;

            imgBetweenDiv.style.height = `${imageHeight}px`;
            imgBetweenDiv.style.width = `${imageWidth}px`;

            this.img.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${imgDeg}deg) scale(${zoomRate / 100})`;

            zoomRateTextBox.value = Math.floor(zoomRate);

        }


        // show インスタンスメソッドが呼ばれたときにすぐに発生するイベント定義
        $('#filePreviewDialog').on('show.bs.modal', function (e) {
            // 前回表示状態を初期化（transitionDuration で起きるアニメーションの無効果を含む）
            this.img.style.display = 'none';
            imgBetweenDiv.style.removeProperty('height');
            imgBetweenDiv.style.removeProperty('width');
            //zoomSliderBar.style.display = 'none';
            zoomRateTextBox.value = '';
            imgDeg = 0;

            // 画像表示制御
            imgDiv.style.display = this.img.src ? 'grid' : 'none'; // 子要素の margin:auto とあわせると、画像が中央に配置される
            imgBetweenDiv.style.display = this.img.src ? '' : 'none';
            rotateLeftButton.style.display = this.img.src ? '' : 'none';
            rotateRightButton.style.display = this.img.src ? '' : 'none';
            zoomInButton.style.display = this.img.src ? '' : 'none';
            zoomOutButton.style.display = this.img.src ? '' : 'none';
            heightBaseButton.style.display = this.img.src ? '' : 'none';
            widthBaseButton.style.display = this.img.src ? '' : 'none';
            zoomRateTextBox.style.display = this.img.src ? '' : 'none';

        }.bind(this));  // bind `this` to the event handler

        // show インスタンスメソッドが呼ばれた後にすぐに発生するイベント定義
        $('#filePreviewDialog').on('shown.bs.modal', function (e) {
            console.warn(`shownの方 imgDiv.style.height = ${imgDiv.style.height};`);

            // 画像サイズの初期化
            zoomRate = Math.floor((imgDiv.clientHeight / this.img.height) * 100);
            adjustImage();

            // 画像を表示
            this.img.style.display = '';


        }.bind(this));

        // モーダルがユーザから見えなくなった直後に発生するイベント定義
        $('#filePreviewDialog').on('hidden.bs.modal', function (e) {

            $(modal).modal('hide');
        });

    }

    show() {

        $('#filePreviewDialog').modal('show');

    }


}
