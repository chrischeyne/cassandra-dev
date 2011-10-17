from bottle import route,run
@route('/')
@route('/index.html')

def index():
    return "<a href='/hello'>Go to gello world page</a>"

@route('/hello')
def hello():
    return "Hello world!2"

run(host='localhost',port=8080)


