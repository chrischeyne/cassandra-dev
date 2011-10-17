from bottle import route,run
@route('/hello')
def hello():
    return "Hello world!"

run(host='localhost',port=8080)


