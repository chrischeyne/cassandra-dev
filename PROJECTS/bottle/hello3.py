from bottle import route,run
@route('/')
@route('/index.html')

def index():
    return "<a href='/hello'>Go to gello world page</a>"

@route('/hello/:name')
def hello(name):
    return "Hello %s" % name

run(host='localhost',port=8080)


