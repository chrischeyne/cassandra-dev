import web

ulrs = (
        '/helloworld', 'helloworld',
        )

import luban.content as lc

class helloworld:

    def __init__(self):
        from luban.weaver.web import create as createWeaver
        self.weaver = createWeaver(
                controller_url='helloworld',
                statichtmlbase='static')
        return

def welcome(self):
    frame = lc.frame(title='my application')
    doc = frame.document(title='hello world',id='doc1')
    return self.weaver.weave(frame)

def GET(self): return self.welcome()

app = web.application(urls,globals())

if __name__ == '__main__': app.run()


