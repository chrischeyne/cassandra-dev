#!/usr/bin/env python

# Fri Oct 14 16:56:29 BST 2011
import sqlite3
from bottle import route,run,debug,template,request

@route('/todo')
def todo_list():
    conn = sqlite3.connect('todo.db')
    c = conn.cursor()
    c.execute("select id,task from todo where status like '1'")
    result = c.fetchall()
    c.close()
    return template('make_table',rows=result)

@route('/new',method='GET')
def new_item():

    if request.GET.get('save','').strip():

        new = request.GET.get('task','').strip()
        conn = sqlite3.connect('todo.db')
        c = conn.cursor()

        c.execute("insert into todo (task,status) values (?,?)",(new,1))

        new_id = c.lastrowid

        conn.commit()
        c.close()

        return '<p>the new task was inserted into the database, ID %s</p>' % new_id
    else:
        return template('new_task.tpl')

@route('/edit/:no',method='GET')
def edit_item(no):

    if request.GET.get('save','').strip():
        edit = request.GET.get('task','').strip()
        status = request.GET.get('status','').strip()

        if status == 'open':
            status = 1
        else:
            status = 0

        conn = sqlite3.connect('todo.db')
        c = conn.cursor()
        c.execute("UPDATE todo SET task=?,status=? WHERE id \
                LIKE?",(edit,status,no))
        conn.commit()

    else:
        conn = sqlite3.connect('todo.db')
        c = conn.cursor()
        c.execute("SELECT task FROM todo WHERE id LIKE?",(str(no)))
        cur_data = c.fetchone()
        return template('edit_task',old=cur_data,no=no)

# FIXME: UPDATE THIS GET HOMEPAGE OPERATIONAL
# FIXME: CQL DRIVER?
@route('/',method='GET')
def home_page():
    return template('homepage')



debug(True)
run(reloader=True)



