#!/usr/bin/env python


import web

urls = (
    '/helloworld', 'helloworld',
    )


import luban.content as lc


class helloworld:


    def __init__(self):
        from luban.weaver.web import create as createWeaver
        self.weaver = createWeaver(
            controller_url = 'helloworld',
            statichtmlbase='static')
        return


    def welcome(self):
        # the overall frame
        frame = lc.frame(title='my application')
        # a document in the frame
        doc = frame.document(title='Hello world!', id='doc1')
        # a button in the document
        b = lc.button(label='click me to show an alert'); doc.add(b)
        b.onclick = lc.alert('clicked!')
        # another button
        b2 = lc.button(label='click me to add a new paragraph'); doc.add(b2)
        b2.onclick = lc.load(routine='onbutton2')
        # weave to produce html
        return self.weaver.weave(frame)


    def onbutton2(self, input=None):
        p = lc.paragraph(text=['new paragraph'])
        action = lc.select(id='doc1').append(p)
        return self.weaver.weave(action)


    def GET(self):
        i = web.input()
        if i: return self._handleInput()
        return self.welcome()


    def _handleInput(self):
        i = web.input()
        routine = i.pop('routine')
        routine = getattr(self, routine)
        return routine(i)


app = web.application(urls, globals())


if __name__ == '__main__': app.run()
