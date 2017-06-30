Makeen's goal is to be a simple, but full featured framework for building server side and client side applications.

Our plan is to provide enough functionality to eliminate the tedious and repetitive tasks that take like 80% of the development time (could go down to 70%, 60%), so you can concentrate on the real core of your project.

We use express.js as a server side web framework, which is simple, unopinionated, powerful and fast.
That is great because you're free to do your own setup, but when it comes to integrating 3rd party extensions you have to follow a strict and rigid process and often times you'll run into issues.

Simplicity always comes with a cost, and that is extensibility.
We tried to solve that by providing a module system that allows you to divide your project into multiple bits that can be developed in isolation and collaboration.

express.js puts on the table a great paradigm of a list of tasks that will run between intercepting a request and returning a response. They call them middlewares and when used wisely you have a lot of flexibility to modify the request-response cycle.

But the order of middlewares chain is important, especially because some of them can stop the execution or modify the request in a way that will impact downstream middlewares.
Bundling together middlewares from 3rd party extensions is often times hard and unintuitive, but we have a solution to that.
You get access to a middlewares array providing simple ways to insert / update / move or remove items.
