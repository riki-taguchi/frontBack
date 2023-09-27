from flask import Flask, request
from flask_cors import CORS
from flask import render_template
from flask import jsonify
import os
import shutil
import pyodbc

# Webサーバーの基本的な機能を提供するもの
app = Flask(__name__)
CORS(app)  # CORS設定を追加

@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        # リクエストからすべてのファイルを取得
        files = request.files.to_dict()

        # 各ファイルをデータベースに保存
        file_infos = []
        for file_key in files:
            file = files[file_key]
            file_id = save_to_database(file)
            file_info = {
                'id': file_id,
                'name': file.filename,
                'link': '/static/' + file.filename  # ここは実際のファイルへのパスに置き換えてください
            }
            file_infos.append(file_info)

        return jsonify(file_infos)
    elif request.method == 'GET':
        # データベースからファイル情報を取得
        file_infos = get_from_database()
        return jsonify(file_infos)

@app.route('/upload/<int:file_id>', methods=['DELETE'])
def delete_file(file_id):
    delete_from_database(file_id)
    return jsonify({'result': 'success'})

@app.route('/frontBack.html')
def your_html_file():
    return render_template('frontBack.html')

def delete_from_database(file_id):
    # データベース接続とカーソル作成
    connection = pyodbc.connect('DRIVER={ODBC Driver 17 for SQL Server};SERVER=(localdb)\\MSSQLLocalDB;DATABASE=TestDb;Trusted_Connection=yes')
    cursor = connection.cursor()

    # データベースから特定のデータを削除
    cursor.execute("DELETE FROM TestDbTable WHERE id = ?", file_id)

    # コミットして変更を保存
    connection.commit()


def get_from_database():
    # データベース接続とカーソル作成
    connection = pyodbc.connect('DRIVER={ODBC Driver 17 for SQL Server};SERVER=(localdb)\\MSSQLLocalDB;DATABASE=TestDb;Trusted_Connection=yes')
    cursor = connection.cursor()

    # データベースからすべてのファイルデータを取得
    cursor.execute("SELECT id, name FROM TestDbTable")

    # 取得したデータをリストに格納
    file_infos = []
    for row in cursor:
        file_info = {
            'id': row[0],  # ID列
            'name': row[1],  # name列
            'link': '/static/' + row[1]  # link列
        }
        file_infos.append(file_info)

    return file_infos



def save_to_database(file):
    # データベース接続とカーソル作成
    connection = pyodbc.connect('DRIVER={ODBC Driver 17 for SQL Server};SERVER=(localdb)\\MSSQLLocalDB;DATABASE=TestDb;Trusted_Connection=yes')
    cursor = connection.cursor()

    # ファイルデータをバイト列として読み込み
    file_data = file.read()

    # ファイルをstaticディレクトリに保存
    file_path = os.path.join('static', file.filename)
    with open(file_path, 'wb') as f:
        f.write(file_data)

    # データベースにファイル名とパスを保存
    cursor.execute("INSERT INTO TestDbTable (name, path) OUTPUT INSERTED.ID VALUES (?, ?)", file.filename, file_path)

    # 新しく挿入された行のIDを取得
    row_id = cursor.fetchone()[0]

    # コミットして変更を保存
    connection.commit()

    # 新しく挿入された行のIDを返す
    return row_id



if __name__ == '__main__':
    app.run(debug=True)
