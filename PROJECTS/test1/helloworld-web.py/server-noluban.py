import web

urls = (
    '/helloworld', 'helloworld',
    )

class helloworld:

    def welcome(self): return "Hello World!"

    def GET(self):
        return self.welcome()

app = web.application(urls, globals())


if __name__ == '__main__': app.run()
