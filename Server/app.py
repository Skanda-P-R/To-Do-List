from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_cors import CORS
from flask_mysqldb import MySQL
import MySQLdb.cursors
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = os.getenv('sql_username')
app.config['MYSQL_PASSWORD'] = os.getenv('sql_password')
app.config['MYSQL_DB'] = 'todo_db'

mysql = MySQL(app)

@app.route('/')
def index():
    return "Nothing Here to See"

@app.route("/get", methods=["GET"])
def get_tasks():
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("SELECT task FROM todos ORDER BY order_position ASC")
    tasks = cursor.fetchall()
    cursor.close()
    task_list = [row["task"] for row in tasks]
    return jsonify(task_list)


@app.route("/add", methods=["POST"])
def add():
    data = request.get_json()
    text = data['text']
    index = data['index']
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("INSERT INTO todos (task, order_position) VALUES (%s, %s)", (text,index))
    mysql.connection.commit()
    cursor.close()
    return 'Done'

@app.route("/delete", methods=["POST"])
def delete_task():
    data = request.get_json()
    index = data['index']
    cursor = mysql.connection.cursor()
    cursor.execute("DELETE FROM todos WHERE order_position = %s", (index,))
    cursor.execute("UPDATE todos SET order_position = order_position - 1 WHERE order_position > %s", (index,))
    mysql.connection.commit()
    cursor.close()
    return 'Deleted'

@app.route("/move-up", methods=["POST"])
def move_up():
    data = request.get_json()
    index = data['index']
    cursor = mysql.connection.cursor()
    cursor.execute("UPDATE todos SET order_position = -1 WHERE order_position = %s", (index - 1,))
    cursor.execute("UPDATE todos SET order_position = %s WHERE order_position = %s", (index - 1, index))
    cursor.execute("UPDATE todos SET order_position = %s WHERE order_position = -1", (index,))
    mysql.connection.commit()
    cursor.close()
    return 'Moved Up'

@app.route("/move-down", methods=["POST"])
def move_down():
    data = request.get_json()
    index = data['index']
    cursor = mysql.connection.cursor()
    cursor.execute("UPDATE todos SET order_position = -1 WHERE order_position = %s", (index + 1,))
    cursor.execute("UPDATE todos SET order_position = %s WHERE order_position = %s", (index + 1, index))
    cursor.execute("UPDATE todos SET order_position = %s WHERE order_position = -1", (index,))
    mysql.connection.commit()
    cursor.close()
    return 'Moved Down'

if __name__ == "__main__":
    app.run(debug=True, port=5000)